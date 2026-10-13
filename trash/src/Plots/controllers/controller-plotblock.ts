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
import Project from '../../Project/models/models-project';
import { plotBlockService } from '../index-plotblock';
import { CreatePlotBlockDto, PlotBlockQueryParams } from '../types/types-plotblock';
import PlotBlock from '../models/models-plotblock';

const handleError = (error: any, next: NextFunction) => {
  next(error);
};

export const plotBlockController = {
  /**
   * Create new plot block.
   * The block's area is atomically reserved against its project's allocatedBase -
   * two concurrent creates can never together exceed the project's area.
   */
  createPlotBlock: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const createData: CreatePlotBlockDto = req.body;

      if (!createData.plotBlockName?.trim()) {
        throw new AppError(400, 'Plot Block Name is required');
      }

      if (!createData.projectId) {
        throw new AppError(400, 'Project ID is required');
      }

      if (!createData.blockTotalArea || createData.blockTotalArea <= 0) {
        throw new AppError(400, 'Block Total Area must be greater than 0');
      }

      const exists = await plotBlockService.checkPlotBlockExists(
        createData.plotBlockName,
        createData.projectId
      );
      if (exists) {
        throw new AppError(409, 'Plot Block with this name already exists in this project');
      }

      const project = await Project.findOne({ _id: createData.projectId, isDeleted: false });
      if (!project) {
        throw new AppError(404, 'Project not found');
      }

      // Block always inherits the project's unit - prevents a unit mismatch from
      // silently bypassing the area check.
      const unit = normalizeAreaUnit(project.areaUnit);
      createData.blockAreaUnit = unit;
      const deltaBase = toBaseSqft(createData.blockTotalArea, unit);

      const plotBlock = await reserveThenAct({
        reserve: session =>
          reserveAreaOnParent(Project, createData.projectId, deltaBase, session, 'Project', unit),
        action: session => plotBlockService.createPlotBlock(createData, req.user!.userId, session),
        release: session =>
          reserveAreaOnParent(
            Project,
            createData.projectId,
            negateBase(deltaBase),
            session,
            'Project',
            unit
          ),
      });

      res.status(201).json({
        success: true,
        data: plotBlock,
        message: 'Plot Block created successfully',
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Get plot block by ID
   */
  getPlotBlock: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const plotBlock = await plotBlockService.getPlotBlockById(id);

      if (!plotBlock || (plotBlock as any).isDeleted) {
        throw new AppError(404, 'Plot Block not found');
      }

      res.json({
        success: true,
        data: plotBlock,
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Get all plot blocks
   */
  getPlotBlocks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryParams: PlotBlockQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        projectId: req.query.projectId as string,
      };

      const result = await plotBlockService.getPlotBlocks(queryParams);

      res.json({
        success: true,
        data: {
          plotBlocks: result.plotBlocks,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Live "area remaining" summary for a plot block's own children (Plots).
   */
  getPlotBlockAreaSummary: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const block = await PlotBlock.findOne({ _id: id, isDeleted: false });
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
   * Update plot block. Resizing or moving a block re-reserves the delta against
   * the (old/new) project's allocatedBase atomically.
   */
  updatePlotBlock: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const id = req.params.id as string;
      const updateData = req.body;

      const existingBlock = await PlotBlock.findOne({ _id: id, isDeleted: false });
      if (!existingBlock) {
        throw new AppError(404, 'Plot Block not found');
      }

      if (
        updateData.plotBlockName &&
        updateData.plotBlockName !== existingBlock.plotBlockName
      ) {
        const exists = await plotBlockService.checkPlotBlockExists(updateData.plotBlockName, id);
        if (exists) {
          throw new AppError(409, 'Plot Block with this name already exists');
        }
      }

      const isMovingProject =
        updateData.projectId && String(updateData.projectId) !== String(existingBlock.projectId);
      const isResizing = updateData.blockTotalArea !== undefined;

      // Plain field-only update (no area/project change) - no reservation needed.
      if (!isMovingProject && !isResizing) {
        delete updateData.blockAreaUnit; // unit always tracks the project, never user-settable alone
        const updatedPlotBlock = await plotBlockService.updatePlotBlock(id, updateData, req.user.userId);
        res.json({ success: true, data: updatedPlotBlock, message: 'Plot Block updated successfully' });
        return;
      }

      if (updateData.blockTotalArea !== undefined && updateData.blockTotalArea <= 0) {
        throw new AppError(400, 'Block Total Area must be greater than 0');
      }

      const oldProject = await Project.findOne({ _id: existingBlock.projectId, isDeleted: false });
      if (!oldProject) {
        throw new AppError(404, 'Current project not found');
      }

      const newProject = isMovingProject
        ? await Project.findOne({ _id: updateData.projectId, isDeleted: false })
        : oldProject;
      if (!newProject) {
        throw new AppError(404, 'Target project not found');
      }

      const newAreaDisplay = isResizing ? updateData.blockTotalArea : existingBlock.blockTotalArea;
      if (!newAreaDisplay || newAreaDisplay <= 0) {
        throw new AppError(400, 'Block Total Area must be greater than 0');
      }

      if (isMovingProject && oldProject.areaUnit !== newProject.areaUnit && !isResizing) {
        throw new AppError(
          400,
          `Target project uses a different area unit (${newProject.areaUnit}) than the current one ` +
          `(${oldProject.areaUnit}). Please re-enter the Total Area in the new unit to move this block.`
        );
      }

      const newUnit = normalizeAreaUnit(newProject.areaUnit);
      updateData.blockAreaUnit = newUnit;
      const newAreaBase = toBaseSqft(newAreaDisplay, newUnit);

      if (!isMovingProject) {
        // Same project: just the delta needs to be re-reserved.
        const delta = subtractBase(newAreaBase, existingBlock.areaBase);
        const updatedPlotBlock = await reserveThenAct({
          reserve: session =>
            reserveAreaOnParent(Project, oldProject._id, delta, session, 'Project', newUnit),
          action: session => plotBlockService.updatePlotBlock(id, updateData, req.user!.userId, session),
          release: session =>
            reserveAreaOnParent(Project, oldProject._id, negateBase(delta), session, 'Project', newUnit),
        });
        res.json({ success: true, data: updatedPlotBlock, message: 'Plot Block updated successfully' });
        return;
      }

      // Moving to a different project: release from old, reserve on new, as one unit.
      const oldAreaBase = existingBlock.areaBase;
      const updatedPlotBlock = await reserveThenAct({
        reserve: async session => {
          await reserveAreaOnParent(
            Project,
            oldProject._id,
            negateBase(oldAreaBase),
            session,
            'Project',
            normalizeAreaUnit(oldProject.areaUnit)
          );
          await reserveAreaOnParent(Project, newProject._id, newAreaBase, session, 'Project', newUnit);
        },
        action: session => plotBlockService.updatePlotBlock(id, updateData, req.user!.userId, session),
        release: async session => {
          await reserveAreaOnParent(
            Project,
            newProject._id,
            negateBase(newAreaBase),
            session,
            'Project',
            newUnit
          );
          await reserveAreaOnParent(
            Project,
            oldProject._id,
            oldAreaBase,
            session,
            'Project',
            normalizeAreaUnit(oldProject.areaUnit)
          );
        },
      });

      res.json({
        success: true,
        data: updatedPlotBlock,
        message: 'Plot Block updated successfully',
      });
    } catch (error) {
      handleError(error, next);
    }
  },

  /**
   * Delete plot block - releases its reserved area from the project before removing it.
   */
  deletePlotBlock: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const id = req.params.id as string;

      const existingBlock = await PlotBlock.findOne({ _id: id, isDeleted: false });
      if (!existingBlock) {
        throw new AppError(404, 'Plot Block not found');
      }

      const project = await Project.findOne({ _id: existingBlock.projectId, isDeleted: false });
      const unit = normalizeAreaUnit(project?.areaUnit || existingBlock.blockAreaUnit || 'sqft');
      const areaBase = existingBlock.areaBase;

      await reserveThenAct({
        reserve: session =>
          project
            ? reserveAreaOnParent(Project, project._id, negateBase(areaBase), session, 'Project', unit)
            : Promise.resolve(),
        action: session => plotBlockService.deletePlotBlock(id, req.user!.userId, session),
        release: session =>
          project
            ? reserveAreaOnParent(Project, project._id, areaBase, session, 'Project', unit)
            : Promise.resolve(),
      });

      res.json({
        success: true,
        message: 'Plot Block deleted successfully',
      });
    } catch (error) {
      handleError(error, next);
    }
  },
};
