const permissionsTeacher = [
	{
		resource: 'TURMA',
		visible: true,
		writable: false,
	},
	{
		resource: 'GRUPO',
		visible: false,
		writable: false,
	},
	{
		resource: 'ATIVIDADE',
		visible: true,
		writable: true,
	},
	{
		resource: 'CATEGORIA',
		visible: true,
		writable: false,
	},
	{
		resource: 'GASTO',
		visible: true,
		writable: false,
	},
	{
		resource: 'LISTAR TODOS GASTO',
		visible: true,
		writable: true,
	},
];
const permissionsRelative = [
	{
		resource: 'TURMA',
		visible: false,
		writable: false,
	},
	{
		resource: 'GRUPO',
		visible: true,
		writable: false,
	},
	{
		resource: 'ATIVIDADE',
		visible: true,
		writable: false,
	},
	{
		resource: 'CATEGORIA',
		visible: false,
		writable: false,
	},
	{
		resource: 'GASTO',
		visible: true,
		writable: true,
	},
	{
		resource: 'LISTAR TODOS GASTO',
		visible: false,
		writable: false,
	},
];
export const verifyPermission = (role, resource, writable = false) => {
	if (role == 'PRINCIPAL') {
		return true;
	}
	if (role == 'TEACHER') {
		const permission = permissionsTeacher.find((permission) => permission.resource == resource);

		if (!permission.visible) {
			return false;
		}
		if (writable) {
			return permission.writable;
		}

		return true;
	}
	if (role == 'RELATIVE') {
		const permission = permissionsRelative.find((permission) => permission.resource == resource);

		if (!permission.visible) {
			return false;
		}
		if (writable) {
			return permission.writable;
		}
		return true;
	}
};
