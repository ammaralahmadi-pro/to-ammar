import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`متغيّر البيئة المطلوب غير موجود: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  entraTenantId: required("ENTRA_TENANT_ID"),
  entraApiClientId: required("ENTRA_API_CLIENT_ID"),
  graphTenantId: required("GRAPH_TENANT_ID"),
  graphClientId: required("GRAPH_CLIENT_ID"),
  graphClientSecret: required("GRAPH_CLIENT_SECRET"),
};
