import { useCallback, useState } from 'react';
import { CardFamilyGroup } from '../components/Cards/CardFamilyGroup';
import { api } from '../config/api';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ButtonOutlineSecondary } from '../components/ButtonOutlineSecondary';
import { Menu } from '../components/Menu';

export const Home = () => {
	const [familyGroups, setFamilyGroups] = useState([]);
	const getAllFamilyGroups = useCallback(() => {
		let id = sessionStorage.getItem('UserId');
		api.get('/user/' + id).then((res) => {
			setFamilyGroups(res.data.groups);
		});
	}, []);

	const navigate = useNavigate();

	useEffect(() => {
		if (sessionStorage.getItem('UserId') == null) {
			navigate('/login');
		}
	}, []);

	useEffect(() => {
		getAllFamilyGroups();
	}, [getAllFamilyGroups]);
	const deleteFamilyGroup = (e, id) => {
		e.preventDefault();
		api.delete('/group-user-dependent/' + id).then(() => getAllFamilyGroups());
	};
	return (
		<div className="app">
			<Menu />
			<div className="container">
				<div className="my-5 pt-5 d-flex flex-column flex-sm-row justify-content-between">
					<h3 className="pt-3">Grupos Familiares</h3>
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
