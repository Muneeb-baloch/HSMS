import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../../auth/types';
import { AppError } from '../../middleware/error.middleware';
import { reserveAreaOnParent, reserveThenAct } from '../../common/services/areaAllocation.service';
import {
  fromBaseSqft,
  negateBase,
  normalizeAreaUnit,
  subtractBase,
  toBaseSqft,
} from '../../common/utils/areaUnits';
import { plotService } from '../index-plot';
import PlotBlock from '../models/models-plotblock';
import Plot from '../models/models-plot';
import {
  BulkPlotUpdateDto,
  CreatePlotDto,
  PlotAssignmentDto,
  PlotFilterOptions,
  PlotPriceCalculationDto,
  PlotQueryParams,
  PlotType,
} from '../types/types-plot';

const handleError = (error: any, next: NextFunction) => {
  next(error);
};

export const plotController = {
  /**
   * Create new plot. The plot's area (length x width, always sqft) is atomically
   * reserved against its block's allocatedBase - two concurrent creates can never
   * together exceed the block's area.
   */
  createPlot: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const createData: CreatePlotDto = req.body;

      // Validate required fields
      if (!createData.projectId) {
        throw new AppError(400, 'Project ID is required');
      }

      if (!createData.plotNo?.trim()) {
        throw new AppError(400, 'Plot Number is required');
      }

      if (!createData.plotBlockId) {
        throw new AppError(400, 'Plot Block is required');
      }

      if (!createData.plotSizeId) {
        throw new AppError(400, 'Plot Size is required');
      }

      if (!createData.plotType) {
        throw new AppError(400, 'Plot Type is required');
      }

      if (!createData.plotCategoryId) {
        throw new AppError(400, 'Plot Category is required');
      }

      if (!createData.salesStatusId) {
        throw new AppError(400, 'Sales Status is required');
      }

      if (!createData.plotLength || createData.plotLength <= 0) {
        throw new AppError(400, 'Valid Plot Length is required');
      }

      if (!createData.plotWidth || createData.plotWidth <= 0) {
        throw new AppError(400, 'Valid Plot Width is required');
      }

      if (!createData.plotBasePrice || createData.plotBasePrice < 0) {
        throw new AppError(400, 'Valid Base Price is required');
      }

      if (!Object.values(PlotType).includes(createData.plotType)) {
        throw new AppError(400, 'Invalid plot type');
      }

      const block = await PlotBlock.findOne({ _id: createData.plotBlockId, isDeleted: false });
      if (!block) {
        throw new AppError(404, 'Plot Block not found');
      }

      // plotLength/plotWidth are always in feet, so the computed area is always sqft -
      // the plot always inherits its block's display unit (cosmetic only).
      const unit = normalizeAreaUnit(block.blockAreaUnit || 'sqft');
      (createData as any).plotAreaUnit = unit;
      const computedArea = parseFloat((createData.plotLength * createData.plotWidth).toFixed(2));
      const deltaBase = toBaseSqft(computedArea, 'sqft');

      const plot = await reserveThenAct({
        reserve: session =>
          reserveAreaOnParent(PlotBlock, block._id, deltaBase, session, 'Plot Block', unit),
        action: session => plotService.createPlot(createData, req.user!.userId, session),
        release: session =>
          reserveAreaOnParent(PlotBlock, block._id, negateBase(deltaBase), session, 'Plot Block', unit),
      });

      res.status(201).json({
        success: true,
        data: plot,
        message: 'Plot created successfully',
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Live "area remaining" summary for a block (used by the Plot create/edit form).
   */
  getBlockAreaSummary: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blockId = req.params.blockId as string;
      const block = await PlotBlock.findOne({ _id: blockId, isDeleted: false });
      if (!block) {
        throw new AppError(404, 'Plot Block not found');
      }

      const unit = normalizeAreaUnit(block.blockAreaUnit || 'sqft');
      const areaDisplay = fromBaseSqft(block.areaBase, unit);
      const allocatedDisplay = fromBaseSqft(block.allocatedBase, unit);

      res.json({
        success: true,
        data: {
          areaUnit: unit,
          area: areaDisplay,
          allocated: allocatedDisplay,
          remaining: Math.max(0, areaDisplay - allocatedDisplay),
        },
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Get plot by ID
   */
  getPlot: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const plot = await plotService.getPlotById(id);

      if (!plot || (plot as any).isDeleted) {
        throw new AppError(404, 'Plot not found');
      }

      res.json({
        success: true,
        data: plot,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Get plot by registration number
   */
  getPlotByRegistrationNo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const registrationNo = req.params.registrationNo as string;

      const plot = await plotService.getPlotByRegistrationNo(registrationNo);

      if (!plot) {
        throw new AppError(404, 'Plot not found');
      }

      res.json({
        success: true,
        data: plot,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Get all plots
   */
  getPlots: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryParams: PlotQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        projectId: req.query.projectId as string,
        plotBlockId: req.query.plotBlockId as string,
        plotType: req.query.plotType
          ? ((req.query.plotType as string).split(',') as PlotType[])
          : undefined,
        salesStatusId: req.query.salesStatusId
          ? (req.query.salesStatusId as string).split(',')
          : undefined,
        srDevStatId: req.query.srDevStatId
          ? (req.query.srDevStatId as string).split(',')
          : undefined,
        plotCategoryId: req.query.plotCategoryId
          ? (req.query.plotCategoryId as string).split(',')
          : undefined,
        isAvailable: req.query.isAvailable ? req.query.isAvailable === 'true' : undefined,
        isPossessionReady: req.query.isPossessionReady
          ? req.query.isPossessionReady === 'true'
          : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        minArea: req.query.minArea ? parseFloat(req.query.minArea as string) : undefined,
        maxArea: req.query.maxArea ? parseFloat(req.query.maxArea as string) : undefined,
        plotFacing: req.query.plotFacing ? (req.query.plotFacing as string).split(',') : undefined,
        hasFile: req.query.hasFile ? req.query.hasFile === 'true' : undefined,
      };

      const result = await plotService.getPlots(queryParams);

      res.json({
        success: true,
        data: {
          plots: result.plots,
          summary: result.summary,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Update plot
   */
  updatePlot: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const id = req.params.id as string;
      const updateData = req.body;

      const existingPlot = await Plot.findOne({ _id: id, isDeleted: false });
      if (!existingPlot) {
        throw new AppError(404, 'Plot not found');
      }

      if (updateData.plotType && !Object.values(PlotType).includes(updateData.plotType)) {
        throw new AppError(400, 'Invalid plot type');
      }

      const lengthChanged = updateData.plotLength !== undefined;
      const widthChanged = updateData.plotWidth !== undefined;
      const blockChanged =
        updateData.plotBlockId !== undefined &&
        String(updateData.plotBlockId) !== String(existingPlot.plotBlockId);

      // Plain field-only update (no area/block change) - no reservation needed.
      if (!lengthChanged && !widthChanged && !blockChanged) {
        delete updateData.plotAreaUnit; // unit always tracks the block, never user-settable alone
        const updatedPlot = await plotService.updatePlot(id, updateData, req.user.userId);
        res.json({ success: true, data: updatedPlot, message: 'Plot updated successfully' });
        return;
      }

      const oldBlock = await PlotBlock.findOne({ _id: existingPlot.plotBlockId, isDeleted: false });
      if (!oldBlock) {
        throw new AppError(404, 'Current plot block not found');
      }
      const newBlock = blockChanged
        ? await PlotBlock.findOne({ _id: updateData.plotBlockId, isDeleted: false })
        : oldBlock;
      if (!newBlock) {
        throw new AppError(404, 'Target plot block not found');
      }

      const newLength = updateData.plotLength ?? existingPlot.plotLength;
      const newWidth = updateData.plotWidth ?? existingPlot.plotWidth;
      const newComputedArea = parseFloat((newLength * newWidth).toFixed(2));
      const newUnit = normalizeAreaUnit(newBlock.blockAreaUnit || 'sqft');
      updateData.plotAreaUnit = newUnit;
      const newAreaBase = toBaseSqft(newComputedArea, 'sqft');

      if (!blockChanged) {
        const delta = subtractBase(newAreaBase, existingPlot.areaBase);
        const updatedPlot = await reserveThenAct({
          reserve: session =>
            reserveAreaOnParent(PlotBlock, oldBlock._id, delta, session, 'Plot Block', newUnit),
          action: session => plotService.updatePlot(id, updateData, req.user!.userId, session),
          release: session =>
            reserveAreaOnParent(
              PlotBlock,
              oldBlock._id,
              negateBase(delta),
              session,
              'Plot Block',
              newUnit
            ),
        });
        res.json({ success: true, data: updatedPlot, message: 'Plot updated successfully' });
        return;
      }

      // Moving to a different block: release from old, reserve on new, as one unit.
      const oldAreaBase = existingPlot.areaBase;
      const oldUnit = normalizeAreaUnit(oldBlock.blockAreaUnit || 'sqft');
      const updatedPlot = await reserveThenAct({
        reserve: async session => {
          await reserveAreaOnParent(
            PlotBlock,
            oldBlock._id,
            negateBase(oldAreaBase),
            session,
            'Plot Block',
            oldUnit
          );
          await reserveAreaOnParent(
            PlotBlock,
            newBlock._id,
            newAreaBase,
            session,
            'Plot Block',
            newUnit
          );
        },
        action: session => plotService.updatePlot(id, updateData, req.user!.userId, session),
        release: async session => {
          await reserveAreaOnParent(
            PlotBlock,
            newBlock._id,
            negateBase(newAreaBase),
            session,
            'Plot Block',
            newUnit
          );
          await reserveAreaOnParent(
            PlotBlock,
            oldBlock._id,
            oldAreaBase,
            session,
            'Plot Block',
            oldUnit
          );
        },
      });

      res.json({
        success: true,
        data: updatedPlot,
        message: 'Plot updated successfully',
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Delete plot - releases its reserved area from the block before removing it.
   */
  deletePlot: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const id = req.params.id as string;

      const existingPlot = await Plot.findOne({ _id: id, isDeleted: false });
      if (!existingPlot) {
        throw new AppError(404, 'Plot not found');
      }

      const block = await PlotBlock.findOne({ _id: existingPlot.plotBlockId, isDeleted: false });
      const unit = normalizeAreaUnit(block?.blockAreaUnit || 'sqft');
      const areaBase = existingPlot.areaBase;

      await reserveThenAct({
        reserve: session =>
          block
            ? reserveAreaOnParent(PlotBlock, block._id, negateBase(areaBase), session, 'Plot Block', unit)
            : Promise.resolve(),
        action: session => plotService.deletePlot(id, req.user!.userId, session),
        release: session =>
          block
            ? reserveAreaOnParent(PlotBlock, block._id, areaBase, session, 'Plot Block', unit)
            : Promise.resolve(),
      });

      res.json({
        success: true,
        message: 'Plot deleted successfully',
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Calculate plot price
   */
  calculatePlotPrice: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const calculationData: PlotPriceCalculationDto = req.body;

      if (!calculationData.plotSizeId) {
        throw new AppError(400, 'Plot Size ID is required');
      }

      if (!calculationData.plotCategoryId) {
        throw new AppError(400, 'Plot Category ID is required');
      }

      if (!calculationData.plotType) {
        throw new AppError(400, 'Plot Type is required');
      }

      if (!calculationData.plotLength || calculationData.plotLength <= 0) {
        throw new AppError(400, 'Valid Plot Length is required');
      }

      if (!calculationData.plotWidth || calculationData.plotWidth <= 0) {
        throw new AppError(400, 'Valid Plot Width is required');
      }

      const priceCalculation = await plotService.calculatePlotPrice(calculationData);

      res.json({
        success: true,
        data: priceCalculation,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Assign plot to customer
   */
  assignPlotToCustomer: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const assignmentData: PlotAssignmentDto = req.body;

      if (!assignmentData.plotId) {
        throw new AppError(400, 'Plot ID is required');
      }

      if (!assignmentData.fileId) {
        throw new AppError(400, 'File ID is required');
      }

      if (!assignmentData.salesStatusId) {
        throw new AppError(400, 'Sales Status ID is required');
      }

      if (!assignmentData.assignedBy) {
        throw new AppError(400, 'Assigned By is required');
      }

      const plot = await plotService.assignPlotToCustomer(assignmentData, req.user.userId);

      if (!plot) {
        throw new AppError(404, 'Plot not found');
      }

      res.json({
        success: true,
        data: plot,
        message: 'Plot assigned to customer successfully',
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Unassign plot from customer
   */
  unassignPlotFromCustomer: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const plotId = req.params.id as string;

      const plot = await plotService.unassignPlotFromCustomer(plotId, req.user.userId);

      if (!plot) {
        throw new AppError(404, 'Plot not found');
      }

      res.json({
        success: true,
        data: plot,
        message: 'Plot unassigned from customer successfully',
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Get available plots
   */
  getAvailablePlots: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.query.projectId as string;
      const blockId = req.query.blockId as string;

      const plots = await plotService.getAvailablePlots(projectId, blockId);

      res.json({
        success: true,
        data: plots,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Get plots by project
   */
  getPlotsByProject: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.params.projectId as string;

      const plots = await plotService.getPlotsByProject(projectId);

      res.json({
        success: true,
        data: plots,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Get plots by block
   */
  getPlotsByBlock: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blockId = req.params.blockId as string;

      const plots = await plotService.getPlotsByBlock(blockId);

      res.json({
        success: true,
        data: plots,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Get plots by file
   */
  getPlotsByFile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fileId = req.params.fileId as string;

      const plots = await plotService.getPlotsByFile(fileId);

      res.json({
        success: true,
        data: plots,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Mark plot possession ready
   */
  markPossessionReady: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const plotId = req.params.id as string;

      const plot = await plotService.markPossessionReady(plotId, req.user.userId);

      if (!plot) {
        throw new AppError(404, 'Plot not found');
      }

      res.json({
        success: true,
        data: plot,
        message: 'Plot marked as possession ready',
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Update plot documents
   */
  updatePlotDocuments: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const plotId = req.params.id as string;
      const { documents } = req.body;

      if (!documents || !Array.isArray(documents) || documents.length === 0) {
        throw new AppError(400, 'At least one document is required');
      }

      // Validate documents
      for (const doc of documents) {
        if (!doc.documentType || !doc.documentPath) {
          throw new AppError(400, 'Each document must have type and path');
        }
        doc.uploadedBy = req.user.userId;
      }

      const plot = await plotService.updatePlotDocuments(plotId, documents, req.user.userId);

      if (!plot) {
        throw new AppError(404, 'Plot not found');
      }

      res.json({
        success: true,
        data: plot,
        message: 'Plot documents updated successfully',
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Bulk update plots
   */
  bulkUpdatePlots: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const bulkData: BulkPlotUpdateDto = req.body;

      if (!bulkData.plotIds || !Array.isArray(bulkData.plotIds) || bulkData.plotIds.length === 0) {
        throw new AppError(400, 'At least one plot ID is required');
      }

      if (
        !bulkData.field ||
        !['salesStatusId', 'srDevStatId', 'isPossessionReady', 'plotCategoryId'].includes(
          bulkData.field
        )
      ) {
        throw new AppError(400, 'Valid field name is required');
      }

      const result = await plotService.bulkUpdatePlots(bulkData, req.user.userId);

      res.json({
        success: true,
        data: result,
        message: `${result.modified} plots updated successfully`,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Get plot statistics
   */
  getPlotStatistics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.query.projectId as string;

      const statistics = await plotService.getPlotStatistics(projectId);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Search plots with filters
   */
  searchPlotsWithFilters: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: PlotFilterOptions = {
        projectId: req.query.projectId as string,
        blockId: req.query.blockId as string,
        type: req.query.type ? ((req.query.type as string).split(',') as PlotType[]) : undefined,
        category: req.query.category ? (req.query.category as string).split(',') : undefined,
        status: req.query.status ? (req.query.status as string).split(',') : undefined,
        minArea: req.query.minArea ? parseFloat(req.query.minArea as string) : undefined,
        maxArea: req.query.maxArea ? parseFloat(req.query.maxArea as string) : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        facing: req.query.facing ? (req.query.facing as string).split(',') : undefined,
        availability: req.query.availability as 'available' | 'sold' | 'all',
      };

      const plots = await plotService.searchPlotsWithFilters(filters);

      res.json({
        success: true,
        data: plots,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Get plot map data
   */
  getPlotMapData: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.params.projectId as string;

      const mapData = await plotService.getPlotMapData(projectId);

      res.json({
        success: true,
        data: mapData,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Generate plot inventory report
   */
  generatePlotInventoryReport: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.params.projectId as string;

      const report = await plotService.generatePlotInventoryReport(projectId);

      res.json({
        success: true,
        data: report,
        message: 'Plot inventory report generated successfully',
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Get plot types
   */
  getPlotTypes: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const plotTypes = Object.values(PlotType).map(type => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      }));

      res.json({
        success: true,
        data: plotTypes,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Validate plot assignment
   */
  validatePlotAssignment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plotId = req.params.id as string;

      const plot = await plotService.getPlotById(plotId);

      if (!plot) {
        throw new AppError(404, 'Plot not found');
      }

      const validation = {
        canBeAssigned: !plot.fileId,
        currentStatus: plot.salesStatusId,
        isAvailable: !plot.fileId,
        hasPossession: !!plot.possId,
        isPossessionReady: plot.isPossessionReady,
        developmentStatus: plot.srDevStatId,
        requirements: [] as string[],
      };

      if (plot.fileId) {
        validation.requirements.push('Plot is already assigned to a customer');
      }

      if (!plot.salesStatusId || (plot.salesStatusId as any)?.allowsSale === false) {
        validation.requirements.push('Plot sales status does not allow assignment');
      }

      res.json({
        success: true,
        data: validation,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Get plot next actions
   */
  getPlotNextActions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plotId = req.params.id as string;

      const plot = await plotService.getPlotById(plotId);

      if (!plot) {
        throw new AppError(404, 'Plot not found');
      }

      const nextActions = [];

      if (!plot.fileId) {
        nextActions.push({
          action: 'assign',
          label: 'Assign to Customer',
          description: 'Assign this plot to a customer file',
          requiredFields: ['fileId', 'salesStatusId'],
        });
      } else {
        nextActions.push({
          action: 'update_status',
          label: 'Update Sales Status',
          description: 'Change the sales status of this plot',
          requiredFields: ['salesStatusId'],
        });
      }

      if (plot.fileId && !plot.possId) {
        nextActions.push({
          action: 'initiate_possession',
          label: 'Initiate Possession',
          description: 'Start possession process for this plot',
        });
      }

      if (!plot.isPossessionReady && plot.srDevStatId) {
        nextActions.push({
          action: 'mark_possession_ready',
          label: 'Mark Possession Ready',
          description: 'Mark plot as ready for possession handover',
        });
      }

      if (plot.fileId) {
        nextActions.push({
          action: 'add_document',
          label: 'Add Document',
          description: 'Upload document for this plot',
          requiredFields: ['documentType', 'documentPath'],
        });
      }

      res.json({
        success: true,
        data: {
          plotId,
          plotNo: plot.plotNo,
          currentStatus: plot.salesStatusId,
          isAvailable: !plot.fileId,
          nextActions,
        },
      });
    } catch (error) {
      handleError(error, next);
    }
  },
};
