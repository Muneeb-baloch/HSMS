# PlotSize Simplified Design

**Date:** 2026-09-09  
**Change:** Removed width/length from PlotSize, kept simple

---

## **PlotSize (Simple Template)**

A PlotSize is just a **size category with pricing**.

### Fields:
- **Plot Size Name** - e.g., "5 Marla", "10 Marla", "1 Kanal"
- **Total Area** - e.g., 5 (marlas), 10, etc.
- **Area Unit** - Marla, Sqft, Sqm, Acre, etc.
- **Rate Per Unit** - e.g., 50,000 per marla
- **Standard Base Price** - Auto-calculated = Total Area × Rate Per Unit

### Example:
```
Plot Size Name: 5 Marla
Total Area: 5
Area Unit: Marla
Rate Per Unit: 50000
Standard Base Price: 5 × 50000 = 250,000 ✅
```

---

## **Plot (Actual Plot with Dimensions)**

When creating a **Plot**, users enter:
- **Plot Size** - Select from PlotSize list (e.g., "5 Marla")
- **Plot Width** - Enter manually (e.g., 30 feet)
- **Plot Length** - Enter manually (e.g., 50 feet)
- **Area** - Auto-filled from selected PlotSize
- **Price** - Auto-filled from selected PlotSize

### Example:
```
Plot Number: P001
Plot Size: 5 Marla (auto-filled area=5, price=250,000)
Width: 30 feet
Length: 50 feet
```

---

## **Changes Made**

### Backend
- ✅ Removed `sizeWidth` and `sizeLength` from PlotSize model
- ✅ Simplified validators to check `totalArea` only
- ✅ Simplified service logic
- ✅ Updated DTOs

### Frontend
- ✅ Removed width/length fields from PlotSize form
- ✅ Simplified to 4 fields: Name, Area, Unit, Rate
- ✅ Removed auto-fill logic from Plot create page
- ✅ Width/Length entered manually in Plot form

---

## **Files Modified**

### Backend
- ✅ `src/Plots/models/models-plotsize.ts`
- ✅ `src/Plots/types/types-plotsize.ts`
- ✅ `src/Plots/validators/validator-plotsize.ts`
- ✅ `src/Plots/controllers/controller-plotsize.ts`
- ✅ `src/Plots/services/service-plotsize.ts`

### Frontend
- ✅ `lib/schemas/plotsize.schema.ts`
- ✅ `lib/constants/plotsizeForm.constants.ts`
- ✅ `app/(protected)/plots/create/page.tsx`

---

## **Testing**

Restart backend and try:

### Create PlotSize
```
Plot Size Name: 5 Marla
Total Area: 5
Area Unit: Marla
Rate Per Unit: 50000
→ Base Price = 250,000 ✅
```

### Create Plot
```
Select PlotSize: 5 Marla
Width: 30
Length: 50
→ Plot created with 5 Marla size @ 250,000 ✅
```

---

## **Benefits**

✅ **Simpler** - Only 4 fields for PlotSize
✅ **Clearer** - PlotSize is template, Plot has dimensions
✅ **Flexible** - Same PlotSize can have different width/length
✅ **Less confusion** - No auto-fill complexity
✅ **Easy to maintain** - Straightforward logic

