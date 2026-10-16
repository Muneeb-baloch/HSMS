# Core Schema Reference

## Plot
projectId: ObjectId, required, ref: Project
possId: ObjectId, ref: Possession
plotNo: String, required, unique per project
plotBlockId: ObjectId, required, ref: PlotBlock
plotSizeId: ObjectId, required, ref: PlotSize
plotType: String, required, enum: residential/commercial/industrial/agricultural/corner/park_facing/main_boulevard/standard
plotCategoryId: ObjectId, required, ref: PlotCategory
plotStreet: String
plotLength: Number, required, min: 1 (feet)
plotWidth: Number, required, min: 1 (feet)
plotArea: Number, required (length × width, computed)
plotAreaUnit: String, required, enum: marla/kanal/acre/hectare/sqyd/sqft
areaBase: Decimal128, required (canonical sqft, computed from length×width)
srDevStatId: ObjectId, ref: SrDevStatus
salesStatusId: ObjectId, required, ref: SalesStatus
surchargeAmount: Number, required, min: 0
fileId: ObjectId, ref: File
plotBasePrice: Number, required, min: 0
plotTotalAmount: Number, required, min: 0 (basePrice + surcharge - discount, computed)
discountAmount: Number, required, min: 0
discountDate: Date
isPossessionReady: Boolean, default: false
plotRegistrationNo: String, unique (auto-generated: PREFIX-BLOCKCODE-COUNTER)
plotCornerNo: Number, min: 1
plotFacing: String, enum: N/S/E/W/NE/NW/SE/SW
plotDimensions: String (computed: "30×60")
plotRemarks: String, maxlength: 1000
plotLatitude: Number, range: -90 to 90
plotLongitude: Number, range: -180 to 180
plotBoundaryPoints: Array of {lat, lng}
plotDocuments: Array of {documentType, documentPath, uploadedDate, uploadedBy}
societyId: ObjectId, required, ref: Society

**Virtuals:** formattedTotalAmount (PKR currency), formattedArea (with unit conversion), dimensionsWithUnit, plotNetPrice, pricePerUnit, discountPercentage, plotStatus, nextActions, locationDescription
**Hooks:** pre-save recalculates plotArea, areaBase, plotDimensions, plotTotalAmount; pre-update recalculates total when price components change; auto-generates plotRegistrationNo
**Indexes:** unique {projectId, plotNo, isDeleted}; compound {projectId, isDeleted}, {plotBlockId, isDeleted}, {salesStatusId, isDeleted}; text index on plotNo, plotRegistrationNo, plotStreet, plotRemarks, plotDimensions; geo index on latitude/longitude

## PlotSize
plotSizeName: String, required, unique, minlength: 2, maxlength: 100
societyId: ObjectId, ref: Society
projectId: ObjectId, required, ref: Project
sizeLength: Number, required, min: 0.01
sizeWidth: Number, required, min: 0.01
totalArea: Number, required, min: 0.01
areaUnit: String, required, enum: marla/sqft/sqm/acre/hectare/kanal, default: marla
ratePerUnit: Number, required, min: 0
standardBasePrice: Number, required, min: 0 (totalArea × ratePerUnit, computed)

**Virtuals:** formattedPrice (PKR), formattedRate (PKR)
**Hooks:** pre-save recalculates standardBasePrice from totalArea × ratePerUnit when either changes; pre-update recalculates on findOneAndUpdate
**Indexes:** unique plotSizeName; compound {areaUnit, isDeleted}, {standardBasePrice, isDeleted}; text index on plotSizeName

## File
fileRegNo: String, required, uppercase, minlength: 5, maxlength: 50
fileBarCode: String (auto-generated if missing)
planId: ObjectId, required, ref: InstallmentPlan
memId: ObjectId, required, ref: Member
nomineeId: ObjectId, ref: Nominee
applicationId: ObjectId, ref: Application
plotId: ObjectId, required, ref: Plot
contractPrice: Number, required, min: 0 (snapshot from Plot.plotTotalAmount at booking)
priceSnapshotAt: Date, required
paymentMode: String, required (validated via LookupValue: payment_mode)
isAdjusted: Boolean, default: false
adjustmentRef: String, maxlength: 100
status: String, default: Pending (validated via LookupValue: file_status)
fileRemarks: String, maxlength: 1000
bookingDate: Date, required
expectedCompletionDate: Date (auto-set to 1 year from bookingDate if missing)
actualCompletionDate: Date
cancellationDate: Date
cancellationReason: String, maxlength: 500
societyId: ObjectId, required, ref: Society

**Virtuals:** balanceAmount (contractPrice pre-ledger, overwritten by fileService.attachFinancials()), fileAge (days since booking), statusBadgeColor, plan, member, nominee, application, plot, createdByUser, modifiedByUser
**Hooks:** pre-save auto-generates fileBarCode, sets expectedCompletionDate if missing, sets cancellationDate if status changes to Cancelled; pre-update sets cancellationDate on cancel, actualCompletionDate on close
**Indexes:** unique {fileRegNo, isDeleted}, {fileBarCode, isDeleted}; compound {plotId, memId}, {status, isActive}, {memId, isDeleted}, {bookingDate, status}; text index on fileRegNo, fileBarCode, fileRemarks, adjustmentRef, cancellationReason

## InstallmentPlan
projId: ObjectId, required, ref: Project
planName: String, required, minlength: 3, maxlength: 100
totalMonths: Number, required, min: 1, max: 360
totalAmount: Number, required, min: 0
isActive: Boolean, default: true

**Virtuals:** projId_populated, createdByUser, updatedByUser
**Indexes:** unique {projId, planName} with partialFilterExpression isDeleted=false; compound {isActive, isDeleted}

## InstallmentPlanDetail
planId: ObjectId, required, ref: InstallmentPlan
instCatId: ObjectId, required, ref: InstallmentCategory
societyId: ObjectId, ref: Society
occurrence: Number, required, min: 1 (nth installment within plan)
percentageAmount: Number, min: 0, max: 100, default: 0
fixedAmount: Number, min: 0, default: 0

**Virtuals:** planId_populated, instCatId_populated, createdByUser, updatedByUser
**Indexes:** unique {planId, occurrence} with partialFilterExpression isDeleted=false; compound {societyId, isDeleted}

## InstallmentCategory
instCatName: String, required, unique
instCatDescription: String, maxlength: 500
kind: String, required, enum: down_payment/installment/possession_fee/legal_fee/application_fee/noc_fee/registry_fee/other (deterministic type classification)
societyId: ObjectId, ref: Society
isRefundable: Boolean, default: false
isMandatory: Boolean, default: true
sequenceOrder: Number, required, min: 1 (for sorting)
isActive: Boolean, default: true

**Virtuals:** createdByUser, modifiedByUser
**Hooks:** pre-save validates unique sequenceOrder per active category; pre-update same validation
**Indexes:** unique instCatName; compound {societyId, isActive}, {kind, isActive}, {isActive, sequenceOrder}, {isMandatory, isActive}, {isRefundable, isActive}; text index on instCatName, instCatDescription

## Installment
fileId: ObjectId, required, ref: File (authoritative link; memId/plotId resolved through File)
installmentCategoryId: ObjectId, required, ref: InstallmentCategory
planId: ObjectId, ref: InstallmentPlan
installmentNo: Number, required, min: 1
installmentTitle: String, required, maxlength: 200
installmentType: String, required (validated via LookupValue: installment_type)
dueDate: Date, required
amountDue: Number, required, min: 0
lateFeeSurcharge: Number, min: 0, default: 0 (computed: 0.5% per day, capped at 25%)
totalPayable: Number, required, min: 0 (amountDue + lateFeeSurcharge, computed)
amountPaid: Number, default: 0, min: 0
balanceAmount: Number, default: 0 (totalPayable - amountPaid, computed)
paidDate: Date
paymentMode: String (validated via LookupValue: payment_mode)
transactionRefNo: String, maxlength: 100
status: String, default: Unpaid (auto-computed: Unpaid/Partially Paid/Paid/Overdue/Cancelled)
installmentRemarks: String, maxlength: 1000
societyId: ObjectId, required, ref: Society

**Virtuals:** file, installmentCategory, plan, createdByUser, modifiedByUser, isOverdue (true if dueDate < start of today and not Paid/Cancelled), daysOverdue (computed from start-of-today to now), paymentStatusColor
**Hooks:** pre-save auto-computes totalPayable, balanceAmount, status, lateFeeSurcharge, paidDate; overdue = dueDate < start-of-today (not start-of-now); pre-update recalculates balance/status on amountPaid change
**Indexes:** compound {fileId, installmentNo}, {status, dueDate}, {dueDate, isDeleted}, {installmentCategoryId, status}, {createdBy, createdAt}; text index on installmentTitle, transactionRefNo, installmentRemarks

## BillType
societyId: ObjectId, ref: Society
billTypeName: String, required, unique
billTypeCategory: String, required (validated via LookupValue: bill_type_category)
description: String, maxlength: 500
isRecurring: Boolean, required, default: false
defaultAmount: Number, min: 0
frequency: String, enum: MONTHLY/QUARTERLY/BIANNUALLY/ANNUALLY/ONE_TIME (required if isRecurring=true)
calculationMethod: String, enum: FIXED/PER_UNIT/PERCENTAGE/TIERED
unitType: String, maxlength: 50
ratePerUnit: Number, min: 0 (required if calculationMethod=PER_UNIT)
taxRate: Number, range: 0-100, default: 0
isTaxable: Boolean, default: false
isActive: Boolean, default: true

**Virtuals:** createdByUser, modifiedByUser, billCount (count of BillInfo using this type), categoryBadgeColor
**Hooks:** pre-save validates frequency required if isRecurring=true, PER_UNIT requires unitType and positive ratePerUnit, taxable requires positive taxRate; pre-update same validations
**Indexes:** unique billTypeName; compound {societyId, isDeleted}, {billTypeCategory, isActive}, {isRecurring, isActive}; text index on billTypeName, description

## BillInfo
societyId: ObjectId, required, ref: Society
billNo: String, required, unique, uppercase, minlength: 5, maxlength: 50
billTypeId: ObjectId, required, ref: BillType
fileId: ObjectId, required, ref: File
memId: ObjectId, required, ref: Member
billMonth: String, required, format: "Month Year" (e.g., "January 2026")
previousReading: Number, min: 0
currentReading: Number, min: 0 (must be >= previousReading)
unitsConsumed: Number, min: 0 (currentReading - previousReading, computed)
billAmount: Number, required, min: 0
fineAmount: Number, default: 0, min: 0
arrears: Number, default: 0, min: 0
totalPayable: Number, required, min: 0 (billAmount + fineAmount + arrears, computed)
dueDate: Date, required
gracePeriodDays: Number, default: 7, range: 0-30
status: String, default: Pending (validated via LookupValue: bill_status)
paymentDate: Date
paymentMethod: String, maxlength: 50
transactionId: String, unique sparse, maxlength: 100
notes: String, maxlength: 1000

**Virtuals:** file, member, createdByUser, modifiedByUser, isOverdue (true if now > dueDate + gracePeriodDays and not Paid/Cancelled), daysOverdue, totalPaid (based on status: Paid=full, Partially Paid=50%, else 0), remainingBalance (totalPayable - totalPaid), statusBadgeColor
**Hooks:** pre-save auto-calculates unitsConsumed, totalPayable, updates status to Overdue if past grace period; pre-update same on amount field changes, sets paymentDate on Paid status
**Indexes:** unique billNo; compound {societyId, isDeleted}, {memId, billMonth, billTypeId}, {status, dueDate}, {fileId, isActive}, {dueDate, isActive}; text index on billNo, billMonth, notes, transactionId

## Defaulter
memId: ObjectId, required, ref: Member
plotId: ObjectId, required, ref: Plot
fileId: ObjectId, required, ref: File
totalOverdueAmount: Number, required, min: 0, default: 0
lastPaymentDate: Date
daysOverdue: Number, required, min: 0, default: 0 (computed from lastPaymentDate)
noticeSentCount: Number, required, min: 0, default: 0
status: String, default: Warning (auto-computed: Warning/Suspended/Legal Action/Resolved)
remarks: String, maxlength: 1000
societyId: ObjectId, required, ref: Society
isActive: Boolean, default: true
resolvedAt: Date

**Virtuals:** member, plot, file, createdByUser, modifiedByUser, statusBadgeColor
**Hooks:** pre-save auto-computes daysOverdue from lastPaymentDate and auto-updates status: Warning (30+ days), Suspended (90+ days), Legal Action (180+ days or 3+ notices)
**Indexes:** unique {memId, plotId, fileId}; compound {status, isActive}, {daysOverdue, status}, {totalOverdueAmount}

## PaymentMode
paymentModeName: String, required, unique (case-insensitive), minlength: 1, maxlength: 100
societyId: ObjectId, ref: Society
description: String, maxlength: 500
isActive: Boolean, default: true

**Hooks:** pre-save and pre-update set modifiedOn to current date
**Indexes:** unique paymentModeName with collation en strength 2, partialFilterExpression isDeleted=false; compound {isActive, isDeleted}; text index on paymentModeName, description


