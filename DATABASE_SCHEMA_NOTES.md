# Database Schema Notes

## Media Storage Decision

### Current Implementation
The app currently stores media URLs in the `incidents` table using an array field:

```sql
CREATE TABLE public.incidents (
  ...
  media_urls ARRAY DEFAULT '{}'::text[],
  ...
);
```

### Unused Table: `media`

The database schema includes a separate `media` table that is **NOT currently being used**:

```sql
CREATE TABLE public.media (
  id bigint NOT NULL DEFAULT nextval('media_id_seq'::regclass),
  incident_id bigint NOT NULL,
  storage_path text NOT NULL,
  media_type character varying NOT NULL CHECK (media_type::text = ANY (ARRAY['photo'::character varying, 'video'::character varying]::text[])),
  uploaded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT media_pkey PRIMARY KEY (id)
);
```

### Recommendation: **Remove the `media` table**

**Reasons to remove:**

1. **Simplicity**
   - Array in incidents table is simpler to query
   - No JOIN needed to fetch media with incident
   - Easier to maintain

2. **Performance**
   - Faster queries (no JOIN overhead)
   - Less database complexity
   - Fewer tables to manage

3. **Current Usage**
   - App already working with `media_urls` array
   - No code uses the `media` table
   - Storage bucket handles the actual files

4. **Sufficient for Resident App**
   - Residents submit reports with media
   - Officers view reports with media
   - No need for individual media metadata

**When you'd need the `media` table:**

- Individual media file metadata (size, dimensions, etc.)
- Ability to add/remove media after submission
- Media approval/rejection workflow
- Detailed media audit trail
- Officers uploading additional evidence
- Complex media management in LGU Officers App

### Recommendation for Current Project

**For Resident/Guest App (Phase 1-7):**
- ✅ Keep using `incidents.media_urls` array
- ✅ Remove `media` table from schema
- ✅ Simpler is better for MVP

**For LGU Officers App (Phase 10):**
- ⏳ Re-evaluate if separate `media` table is needed
- ⏳ Consider if officers need to manage media individually
- ⏳ Add back if complex media workflows are required

### SQL to Remove Media Table

```sql
-- Drop the media table if you decide to remove it
DROP TABLE IF EXISTS public.media CASCADE;
DROP SEQUENCE IF EXISTS media_id_seq CASCADE;
```

### Alternative: Keep Both (Not Recommended)

If you want to keep both for future flexibility:

1. **Current behavior:** Continue using `media_urls` array
2. **Add trigger:** Automatically populate `media` table when `media_urls` is updated
3. **Benefit:** Backward compatibility if you need detailed media tracking later
4. **Downside:** Unnecessary complexity for current needs

### Decision Matrix

| Scenario | Use Array | Use Table | Use Both |
|----------|-----------|-----------|----------|
| Simple incident reporting | ✅ | ❌ | ❌ |
| View media with incidents | ✅ | ✅ | ✅ |
| Individual media metadata | ❌ | ✅ | ✅ |
| Add/remove media post-submission | ❌ | ✅ | ✅ |
| Media approval workflow | ❌ | ✅ | ✅ |
| Audit trail per media file | ❌ | ✅ | ✅ |
| **Current Resident App** | ✅ | ❌ | ❌ |
| **Future LGU Officers App** | ❌ | ✅ | ❌ |

---

## Other Schema Considerations

### 1. `incident_id` Type Mismatch

**Issue:** The `media` table references `incident_id` as `bigint`, but `incidents.id` is `uuid`.

```sql
-- media table (WRONG)
incident_id bigint NOT NULL,

-- incidents table (CORRECT)
id uuid NOT NULL DEFAULT gen_random_uuid(),
```

**Fix if keeping media table:**
```sql
ALTER TABLE public.media 
ALTER COLUMN incident_id TYPE uuid 
USING incident_id::text::uuid;
```

### 2. Multiple Officers Assignment

**Current:** `incidents.assigned_officer_id` (single UUID)  
**Future Need:** Multiple officers per incident

**Solution:** Create `incident_assignments` junction table (see MEMORY for details)

---

## Final Recommendation

**For immediate deployment:**
1. ✅ Remove `media` table
2. ✅ Keep using `media_urls` array
3. ✅ Simplify schema for MVP

**For future LGU app:**
1. ⏳ Re-add `media` table if needed
2. ⏳ Add `incident_assignments` table
3. ⏳ Enhance schema based on officer workflows

---

**Last Updated:** November 5, 2025  
**Status:** Recommendation pending user decision
