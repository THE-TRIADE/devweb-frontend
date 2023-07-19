import { useCallback, useState } from 'react';
import { CardFamilyGroup } from '../components/Cards/CardFamilyGroup';
import { api } from '../config/api';
import { useEffect } from 'react';
import { ButtonOutlineSecondary } from '../components/ButtonOutlineSecondary';
import { Menu } from '../components/Menu';
import { verifyPermission } from '../utils/permissions.js';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
	const [familyGroups, setFamilyGroups] = useState([]);
	const [familyGroupsPrincial, setFamilyGroupPrincial] = useState([]);
	const [dependents, setDependents] = useState([]);
	const [permissionType, setPermissionType] = useState('NONE');
	const role = sessionStorage.getItem('role');
	const navigate = useNavigate();

	useEffect(() => {
		const hasWritePermission = verifyPermission(role, 'TURMA', true);
		const hasReadPermission = verifyPermission(role, 'TURMA');

		if (hasWritePermission) {
			setPermissionType('READ/WRITE');
		} else if (hasReadPermission) {
			setPermissionType('READ-ONLY');
		} else {
			setPermissionType('NONE');
		}
		if (sessionStorage.getItem('UserId') == null) {
			navigate('/login');
		}
	}, []);
	const getAllFamilyGroups = useCallback((type) => {
		let id = sessionStorage.getItem('UserId');
		api.get('/user/' + id).then((res) => {
			setFamilyGroups(res.data.groups);
		});
	}, []);
	const getDependents = () => {
		api.get('/user/' + sessionStorage.getItem('UserId')).then((res) => {
			const listDependent = res.data.relations.map((relation) => {
				return {
					dependentName: relation.dependentName,
					dependentId: relation.dependentId,
				};
			});
			setDependents(listDependent);
		});
	};

	const getAllFamilyGroupsPrincipal = useCallback((type) => {
		api.get('/group-user-dependent?groupType=' + type).then((res) => {
			setFamilyGroupPrincial(res.data);
		});
	}, []);

	useEffect(() => {
		getAllFamilyGroups();
		getAllFamilyGroupsPrincipal('FAMILY');
		getDependents();
	}, [getAllFamilyGroups]);
	const deleteFamilyGroup = (e, id) => {
		e.preventDefault();
		api.delete('/group-user-dependent/' + id).then(() => {
			getAllFamilyGroups();
			getAllFamilyGroupsPrincipal('FAMILY');
		});
	};

	return (
		<div className="app">
			<Menu />
			<div className="container">
				<div className="my-5 pt-5 d-flex flex-column flex-sm-row justify-content-between">
					<h3 className="pt-3">Grupos Familiares</h3>
					{permissionType == 'READ/WRITE' && (
						<ButtonOutlineSecondary text="Cadastrar Grupo Familiar" link="/familygroup" />
					)}
				</div>

				<div className="row">
					{permissionType == 'READ/WRITE'
						? familyGroupsPrincial.map((familyGroup) => (
								<CardFamilyGroup
									href="/familyGroupDetails/"
									key={familyGroup.id}
									familyGroup={familyGroup}
									deleteFunction={(e) => deleteFamilyGroup(e, familyGroup.id)}
								/>
						  ))
						: familyGroups.map((familyGroup) => (
								<CardFamilyGroup
									href="/familyGroupDetails/"
									key={familyGroup.id}
									familyGroup={familyGroup}
									deleteFunction={(e) => deleteFamilyGroup(e, familyGroup.id)}
								/>
						  ))}
				</div>
			</div>
		</div>
	);
};
