import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { CustomSpan } from '../components/CustomSpan';
import { TextualInput } from '../components/Inputs/TextualInput';

import { useNavigate } from 'react-router-dom';
import { ButtonOutline } from '../components/ButtonOutline';
import { CustomLink } from '../components/CustomLink/index.jsx';
import { DependentForm } from '../components/DependentForm';
import { CheckBoxInput } from '../components/Inputs/CheckBoxInput/index.jsx';
import { api } from '../config/api';

export const FamilyGroup = () => {
	const [familyGroupForm, setfamilyGroupForm] = useState({
		name: '',
		userId: sessionStorage.getItem('UserId'),
		userRole: 'RELATIVE',
	});
	const [dependents, setDependents] = useState([]);
	const [errorMessages, setErrorMessages] = useState({
		name: null,
	});
	const [dependentCount, setDependentCount] = useState(1);
	const [submit, setSubmit] = useState(false);
	const [allUsers, setAllUsers] = useState([]);
	const [users, setUsers] = useState([]);
	const getAllUsers = () => {
		api.get('/user').then((res) => {
			const usersResponse = res.data;
			res.data.forEach((x) => {
				delete x.groups;
				delete x.relations;
				delete x.role;
			});
			setAllUsers(usersResponse);
		});
	};

	useEffect(() => {
		clearValidationFields();
		getAllUsers();
	}, []);

	useEffect(() => {
		console.log('Dependents', dependents);
	}, [dependents]);

	useEffect(() => {
		if (dependents.length > dependentCount) {
			setDependents((ps) => [...ps.slice(0, -1)]);
		}
	}, [dependentCount]);

	const navigate = useNavigate();

	useEffect(() => {
		if (submit) {
			const newErrors = validateForm();
			let isValid = true;
			Object.values(newErrors).forEach((error) => {
				if (error !== null) {
					isValid = false;
				}
			});

			if (isValid) {
				const newFamilyGroup = { ...familyGroupForm, dependents, users };
				api
					.post('/group-user-dependent', newFamilyGroup)
					.then(() => {
						navigate('/');
					})
					.catch((err) => console.error(err));
			}
		}
		setSubmit(false);
	}, [submit]);

	const updateForm = (inputName, event) => {
		setfamilyGroupForm((prevState) => {
			return { ...prevState, [inputName]: event.target.value };
		});
	};

	const isEmpty = (text) => text.trim() === '';

	const validateForm = () => {
		const newErrorMessages = { ...errorMessages };
		if (isEmpty(familyGroupForm.name)) {
			newErrorMessages.name = 'Este campo não pode ser vazio';
		}
		setErrorMessages(newErrorMessages);
		return newErrorMessages;
	};

	const clearValidationFields = () => {
		setErrorMessages({
			name: null,
		});
	};

	const submitFamilyGroupForm = () => {
		clearValidationFields();
		setSubmit(true);
	};

	const showErrorMessages = (field) => {
		if (errorMessages[field] !== null) {
			return <CustomSpan key={'error-' + field} text={errorMessages[field]} />;
		}
	};

	const updateDependent = (newDependent, index) => {
		newDependent.cpf = newDependent.cpf.replace(/\D/g, '');

		setDependents((ps) => {
			if (index >= 0 && index < ps.length) {
				ps[index] = newDependent;
			} else {
				ps.push(newDependent);
			}
			return [...ps];
		});
	};

	return (
		<div className="app">
			<div className="container my-5 text-center custom-card">
				<h1 className="secondary-color">Olá!</h1>
				<p>Vamos iniciar o cadastro do grupo familiar</p>
				<div className="row text-start">
					<div className="col-12">
						<div className="mt-3">
							<TextualInput
								placeholder="Nome"
								label="Nome do grupo familiar"
								value={familyGroupForm.name}
								onChange={(e) => updateForm('name', e)}
							/>
							{showErrorMessages('name')}
							<h5 className="text-center mt-5 text-secondary">Cadastro de responsáveis</h5>
							<h6 className="p text-center text-muted">Selecione os responsáveis que fazem parte deste grupo </h6>
							{allUsers.map((user) => (
								<CheckBoxInput
									key={user.id}
									value={user.name}
									onChange={(e) => {
										if (e.target.checked) {
											setUsers([...users, user]);
										} else {
											setUsers(users.filter((userInList) => userInList.id !== user.id));
										}
									}}
								/>
							))}
							<div className="row">
								<div className="col-6 pt-3">
									<CustomLink text="Cadastrar Novo Responsável + " to="/signup" />
								</div>
							</div>
							<h5 className="text-center mt-5 text-secondary">Cadastro de dependente(s)</h5>
							<h6 className="p text-center text-muted">Acrescente os dependentes deste grupo</h6>
							<div className="my-3 text-start">
								{Array.from({ length: dependentCount }).map((_, index) => (
									<DependentForm
										counter={index + 1}
										showErrorMessages={showErrorMessages}
										updateDependentCount={setDependentCount}
										updateDependent={updateDependent}
										key={'kdf' + index}
									/>
								))}
								<ButtonOutline onClick={() => setDependentCount((ps) => ps + 1)} text="Adicionar dependente +" />
							</div>
							<Button onClick={submitFamilyGroupForm} text="Finalizar Cadastro" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
