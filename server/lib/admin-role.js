// Bound to the existing owner identity, never to a client-supplied email or role.
export const MASTER_USER_ID='851166e3-d778-403d-95e5-360c98cd6536';
export const isMaster=user=>user?.id===MASTER_USER_ID;
