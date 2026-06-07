export function portalProjectPath(projectId: number) {
  return `/portal/project/${projectId}`;
}

export function portalProfilePath(projectId: number) {
  return `/portal/project/${projectId}/profile`;
}

export function portalModulePath(projectId: number, parentModuleId: number) {
  return `/portal/project/${projectId}/module/${parentModuleId}`;
}

export function portalChildPath(
  projectId: number,
  parentModuleId: number,
  childModuleId: number
) {
  return `/portal/project/${projectId}/module/${parentModuleId}/child/${childModuleId}`;
}

export function portalChildCreatePath(
  projectId: number,
  parentModuleId: number,
  childModuleId: number
) {
  return `${portalChildPath(projectId, parentModuleId, childModuleId)}/create`;
}

export function portalChildPermissionPath(
  projectId: number,
  parentModuleId: number,
  childModuleId: number,
  permissionId: number | string
) {
  return `${portalChildPath(projectId, parentModuleId, childModuleId)}/permissions/${permissionId}`;
}

export function portalChildPermissionEditPath(
  projectId: number,
  parentModuleId: number,
  childModuleId: number,
  permissionId: number | string
) {
  return `${portalChildPermissionPath(projectId, parentModuleId, childModuleId, permissionId)}/edit`;
}

export function portalEmployeeMasterPath(projectId: number) {
  return `/portal/project/${projectId}/employee-master`;
}

export function portalEmployeeMasterCreatePath(projectId: number) {
  return `${portalEmployeeMasterPath(projectId)}/create`;
}

export function portalEmployeeMasterEditPath(
  projectId: number,
  employeeId: number | string
) {
  return `${portalEmployeeMasterPath(projectId)}/${employeeId}/edit`;
}

export function portalChildRecordPath(
  projectId: number,
  parentModuleId: number,
  childModuleId: number,
  recordId: number | string
) {
  return `${portalChildPath(projectId, parentModuleId, childModuleId)}/record/${recordId}`;
}

export function portalChildRecordEditPath(
  projectId: number,
  parentModuleId: number,
  childModuleId: number,
  recordId: number | string
) {
  return `${portalChildRecordPath(projectId, parentModuleId, childModuleId, recordId)}/edit`;
}
