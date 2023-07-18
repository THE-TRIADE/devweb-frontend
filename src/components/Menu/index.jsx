import './styles.css';
import { useLocation } from 'react-router-dom';
import {useEffect, useState} from "react";
import {verifyPermission} from "../../utils/permissions.js";

export const Menu = () => {
	const location = useLocation();
	const [permissionTurmaType, setPermissionTurmaType] = useState('NONE');
	const [permissionGrupoType, setPermissionGrupoType] = useState('NONE');

	const role = sessionStorage.getItem('role');
	useEffect(() => {
		const hasWritePermissionTurma = verifyPermission(role, 'TURMA', true);
		const hasReadPermissionTurma = verifyPermission(role, 'TURMA');
		const hasWritePermissionGrupo = verifyPermission(role, 'GRUPO', true);
		const hasReadPermissionGrupo = verifyPermission(role, 'GRUPO');

		if (hasWritePermissionTurma) {
			setPermissionTurmaType('READ/WRITE');
		} else if (hasReadPermissionTurma) {
			setPermissionTurmaType('READ-ONLY');
		} else {
			setPermissionTurmaType('NONE');
		}

		if (hasWritePermissionGrupo) {
			setPermissionGrupoType('READ/WRITE');
		} else if (hasReadPermissionGrupo) {
			setPermissionGrupoType('READ-ONLY');
		} else {
			setPermissionGrupoType('NONE');
		}
	}, []);

	const isActive = (path) => {
		return location.pathname === path ? 'active' : '';
	};

	return (
		<nav className="navbar navbar-expand-sm fixed-top hide-print">
			<div className="container-fluid">
				<a className="navbar-brand mx-5 text-white" href="#">
					Student Routine
				</a>

				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarNav"
					aria-controls="navbarNav"
					aria-expanded="false"
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>
				</button>
				<div className="collapse navbar-collapse mx-5" id="navbarNav">
					<ul className="navbar-nav">
						{permissionGrupoType != 'NONE' && (
							<li className="nav-item mx-3">
								<a className={`nav-link ${isActive('/')}`} aria-current="page" href="/">
									Grupos Familiares
								</a>
							</li>
						)}
						{permissionTurmaType != 'NONE' && (
						<li className="nav-item mx-3">
							<a className={`nav-link ${isActive('/classes')}`} aria-current="page" href="/classes">
								Turmas
							</a>
						</li>
						)}
						<li className="nav-item mx-3">
							<a className={`nav-link ${isActive('/spents')}`} href="/spents">
								Gastos
							</a>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
};
