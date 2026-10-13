# PlotSize Auto-Fill Implementation

**Date:** 2026-09-09  
**Purpose:** Add width and length fields to PlotSize, auto-calculate total area, and auto-populate these in the Plot Create form

---

## Changes Made

### Backend

#### 1. PlotSize Model (`src/Plots/models/models-plotsize.ts`)
**Added fields:**
- `sizeWidth: number` - Width of the plot size
- `sizeLength: number` - Length of the plot size

**Updated Pre-save Middleware:**
- Auto-calculate `totalArea = sizeWidth × sizeLength` when width or length changes
- Auto-calculate `standardBasePrice = totalArea × ratePerUnit`

**Updated Pre-update Middleware:**
- Handle width/length updates and recalculate totalArea and price accordingly

#### 2. PlotSize Types (`src/Plots/types/types-plotsize.ts`)
**Updated interfaces:**
- `PlotSize` - Added `sizeWidth` and `sizeLength`
- `CreatePlotSizeDto` - Added `sizeWidth` and `sizeLength` as required, made `totalArea` optional
- `UpdatePlotSizeDto` - Added `sizeWidth` and `sizeLength` as optional

---

### Frontend

#### 1. PlotSize Form Schema (`lib/schemas/plotsize.schema.ts`)
**Added validation:**
- `sizeWidth` - Required, min 0.01
- `sizeLength` - Required, min 0.01
- `totalArea` - Made optional (auto-calculated from width × length)

**Updated refine logic:**
- Calculates totalArea from width × length if totalArea not provided
- Uses calculated area for price validation

#### 2. PlotSize Form Constants (`lib/constants/plotsizeForm.constants.ts`)
**Added fields:**
- `sizeWidth` input field
- `sizeLength` input field
- `totalArea` disabled field (shows auto-calculated value)

#### 3. Plot Create Page (`app/(protected)/plots/create/page.tsx`)
**Added logic:**
- `handlePlotSizeChange` function - Fetches the selected PlotSize and auto-fills width/length
- Modified `customFields` to add `onChange` handler to plotSizeId field
- When user selects a PlotSize, it automatically populates:
  - `plotLength` (from `sizeLength`)
  - `plotWidth` (from `sizeWidth`)

**Flow:**
1. User selects a PlotSize from the dropdown
2. EntityForm calls `fieldConfig.onChange` with the plotSizeId value
3. `handlePlotSizeChange` fetches the PlotSize data from API
4. Form fields are auto-populated with width and length values
5. User can still manually override if needed

---

## How It Works

### PlotSize Creation/Edit
1. User enters Plot Size Name, Width, and Length
2. Backend auto-calculates totalArea = width × length
3. Backend auto-calculates standardBasePrice = totalArea × ratePerUnit
4. Frontend shows disabled totalArea field showing the calculated value

### Plot Creation
1. User selects a PlotSize from dropdown
2. Auto-fill triggers and fetches full PlotSize details
3. plotLength and plotWidth fields are populated automatically
4. User can override if needed
5. Submit form to create plot

---

## API Changes Required

### PlotSize GET endpoint
Ensure it returns the complete PlotSize object including:
- `sizeWidth`
- `sizeLength`
- `totalArea` (calculated)
- `standardBasePrice` (calculated)

### PlotSize POST/PUT endpoints
Accept:
- `sizeWidth` (required)
- `sizeLength` (required)
- `totalArea` (optional - will be calculated)
- `standardBasePrice` (optional - will be calculated)

---

## Files Modified

### Backend
- ✅ `src/Plots/models/models-plotsize.ts`
- ✅ `src/Plots/types/types-plotsize.ts`

### Frontend
- ✅ `lib/schemas/plotsize.schema.ts`
- ✅ `lib/constants/plotsizeForm.constants.ts`
- ✅ `app/(protected)/plots/create/page.tsx`

---

## Testing Checklist

- [ ] Create a new PlotSize with width and length
  - [ ] Verify totalArea is auto-calculated as width × length
  - [ ] Verify standardBasePrice is auto-calculated from totalArea × rate
  - [ ] Verify totalArea shows as disabled/read-only in form

- [ ] Create a new Plot
  - [ ] Select a PlotSize from dropdown
  - [ ] Verify plotLength and plotWidth auto-populate
  - [ ] Verify values match the selected PlotSize dimensions
  - [ ] Verify form can still be submitted successfully

- [ ] Edit existing PlotSize
  - [ ] Update width and length
  - [ ] Verify totalArea recalculates
  - [ ] Verify standardBasePrice recalculates

- [ ] Verify backend calculations
  - [ ] Check MongoDB documents have correct width/length/area values
  - [ ] Check price calculations are correct

---

## Benefits

✅ **Reduces Manual Data Entry** - Width/length auto-populated from PlotSize master data
✅ **Consistent Dimensions** - All plots using same PlotSize have matching dimensions
✅ **Auto-Calculated Area** - No manual area calculations needed
✅ **Auto-Calculated Price** - No manual price calculations needed
✅ **Flexible** - Users can still override auto-filled values if needed
✅ **Better Data Quality** - Standardized dimensions across the system

---

## Notes for Future Development

1. Consider adding a "Quick Add" feature for common plot sizes (5 Marla, 10 Marla, 1 Kanal, etc.)
2. Consider adding bulk import for PlotSizes from CSV/Excel
3. Consider adding area unit conversion utilities
4. Consider adding visual representation of plot dimensions

