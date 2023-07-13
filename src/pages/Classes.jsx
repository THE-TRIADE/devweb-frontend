import { useCallback, useState } from 'react';
import { CardFamilyGroup } from '../components/Cards/CardFamilyGroup';
import { api } from '../config/api';
import { useEffect } from 'react';
import { ButtonOutlineSecondary } from '../components/ButtonOutlineSecondary';
import { Menu } from '../components/Menu';

export const Classes = () => {
	const [familyGroups, setFamilyGroups] = useState([]);
	const [recommendations, setRecommendations] = useState([]);
	const [dependents, setDependents] = useState([]);
	const getAllFamilyGroups = useCallback(() => {
		let id = sessionStorage.getItem('UserId');
		api.get('/user/' + id).then((res) => {
			setFamilyGroups(res.data.groups);
		});
	}, []);
	const sortearIdDependente = () => {
		const randomIndex = Math.floor(Math.random() * dependents.length);
		const dependenteSorteado = dependents[randomIndex];
		return dependenteSorteado.dependentId;
	};
	const getRecommendations = () => {
		api.get('/recommendation/' + sortearIdDependente()).then((res) => {
			setRecommendations(res.data);
		});
	};
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

	useEffect(() => {
		if (dependents.length) {
			getRecommendations();
		}
	}, [dependents])

	useEffect(() => {
		getAllFamilyGroups();
		getDependents();
	}, [getAllFamilyGroups]);
	const deleteFamilyGroup = (e, id) => {
		e.preventDefault();
		api.delete('/group-user-dependent/' + id).then(() => getAllFamilyGroups());
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
					<ButtonOutlineSecondary text="Cadastrar Grupo Familiar" link="/familygroup" />
				</div>
				<div className="row">
					{familyGroups.map((familyGroup) => (
						<CardFamilyGroup
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
