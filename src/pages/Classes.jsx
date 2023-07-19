import { useCallback, useState } from 'react';
import { CardFamilyGroup } from '../components/Cards/CardFamilyGroup';
import { api } from '../config/api';
import { useEffect } from 'react';
import { ButtonOutlineSecondary } from '../components/ButtonOutlineSecondary';
import { Menu } from '../components/Menu';
import { verifyPermission } from '../utils/permissions.js';

export const Classes = () => {
	const [familyGroups, setFamilyGroups] = useState([]);
	const [recommendations, setRecommendations] = useState([]);
	const [dependents, setDependents] = useState([]);
	const [permissionType, setPermissionType] = useState('NONE');
	const role = sessionStorage.getItem('role');
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
	}, []);

	const getAllFamilyGroups = useCallback(
		(type) => {
			api.get('/group-user-dependent?groupType=' + type).then((res) => {
				const groupsFiltered = res.data.filter((group) => {
					const userIds = group.users.map((user) => user.id);
					return userIds.some((id) => id == sessionStorage.getItem('UserId'));
				});

				const groups = permissionType == 'READ-ONLY' ? groupsFiltered : res.data;
				setFamilyGroups(groups);
			});
		},
		[permissionType],
	);
	const sortearIdDependente = () => {
		const randomIndex = Math.floor(Math.random() * dependents.length);
		const dependenteSorteado = dependents[randomIndex];
		return dependenteSorteado.id;
	};
	const getRecommendations = () => {
		api.get('/recommendation/' + sortearIdDependente()).then((res) => {
			setRecommendations(res.data);
		});
	};
	const getDependents = () => {
		api.get('/dependent').then((res) => {
			setDependents(res.data);
		});
	};
	useEffect(() => {
		if (dependents.length) {
			getRecommendations();
		}
	}, [dependents]);

	useEffect(() => {
		getAllFamilyGroups('CLASS');
		getDependents();
	}, [getAllFamilyGroups]);
	const deleteFamilyGroup = (e, id) => {
		e.preventDefault();
		api.delete('/group-user-dependent/' + id).then(() => getAllFamilyGroups('CLASS'));
	};
	const randomIndex = Math.floor(Math.random() * recommendations.length);

	return (
		<div className="app">
			<Menu />
			<div className="container">
				{recommendations.length != 0 && (
					<div className="row pt-5 mt-5">
						<div className="p-3 bg-warning bg-opacity-50 border border-warning fw-semibold border-opacity-50 rounded-3">
							{recommendations.length > 1 ? (
								<p className="p-0 m-0">{recommendations[randomIndex]}</p>
							) : (
								recommendations.map((recommendation, index) => (
									<p className="p-0 m-0" key={index}>
										{recommendation}
									</p>
								))
							)}
						</div>
					</div>
				)}
				<div className="my-5 pt-5 d-flex flex-column flex-sm-row justify-content-between">
					<h3 className="pt-3">Turmas</h3>
					{permissionType != 'READ-ONLY' && <ButtonOutlineSecondary text="Cadastrar Turma" link="/classesForm" />}
				</div>
				<div className="row">
					{familyGroups.map((familyGroup) => (
						<CardFamilyGroup
							href="/classesDetails/"
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
