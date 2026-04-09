# Sample API Test Cases

## Authentication
- Login success with valid credentials.
- Login fails with invalid password (`401`).
- Register fails for non-admin token (`403`).
- Forgot password returns generic success even for unknown email.
- Reset password fails for expired token.

## Work Entry CRUD
- Create work entry with valid fields (`201`).
- Create fails for invalid `hoursSpent` (`400`).
- User can only fetch/update/delete own entries (`403` otherwise).
- Rejected report with `canEdit=true` can be edited and is resubmitted as pending.

## Admin Access Control
- `/api/admin/*` and `/api/employees/*` blocked for non-admin (`403`).
- Admin creates employee and receives success response (`201`).

## Validation
- Invalid email for login/register (`400`).
- Missing `project`, `tasks`, or invalid `date` on work entries (`400`).
- Enquiry requires `companyName`, `workEmail`, `phoneNumber`, `teamSize`.
