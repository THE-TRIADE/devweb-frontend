import { useState } from 'react';
import { CardDependents } from '../components/Cards/CardDependents';
import { api } from '../config/api';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Menu } from '../components/Menu';
import { guardianRoleEnum } from './ManageGuardians';

const getActivities = (dependentId) => {
	return api.get('/activity', { params: { dependentId } }).then((res) => {
		let late = 0,
			created = 0,
			inProgress = 0;
		res.data.forEach((activity) => {
			if (activity.state === 'LATE') {
				late++;
			} else if (activity.state === 'CREATED') {
				created++;
			} else if (activity.state === 'IN_PROGRESS') {
				inProgress++;
			}
		});
		return { late, created, inProgress };
	});
};

export const ClassesDetails = () => {
	const { id } = useParams();
	const [familyGroup, setFamilyGroup] = useState(null);
	const [activities, setActivities] = useState({});

	useEffect(() => {
		const getFamilyGroup = () => {
			api.get('/group-user-dependent/' + id).then((res) => {
				setFamilyGroup(res.data);
			});
		};
		getFamilyGroup();
	}, [id]);

	useEffect(() => {

		if (familyGroup) {
			familyGroup.dependents.forEach((dependent) => {
				getActivities(dependent.id).then((activity) => {
					setActivities((a) => ({ ...a, [dependent.id]: activity }));
				});
			});
		}
	}, [familyGroup]);

	return (
		<div className="app">
			<Menu />
			<div className="container">
				<div className="row">
					<h3 className="mt-5 pt-5">{familyGroup && familyGroup.name}</h3>
				</div>
				<div className="row">
					<p className="fw-bold text-secondary my-2">Professores:</p>
					{familyGroup &&
						familyGroup.users.map((user) => (
							<p key={user.id}>{user.name}</p>
						))}
					<p className="fw-bold text-secondary my-2">Estudantes:</p>
					{familyGroup &&
						familyGroup.dependents.map((dependent) => (
							<CardDependents
								key={dependent.id}
								dependent={dependent}
								redirect="/dependentactivities/"
								late={activities[dependent.id]?.late ?? 0}
								created={activities[dependent.id]?.created ?? 0}
								in_progress={activities[dependent.id]?.inProgress ?? 0}
							/>
						))}
				</div>
			</div>
		</div>
	);
};
