import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { CustomSpan } from '../components/CustomSpan';
import { TextualInput } from '../components/Inputs/TextualInput';

import { useNavigate } from 'react-router-dom';
import { CustomLink } from '../components/CustomLink/index.jsx';
import { CheckBoxInput } from '../components/Inputs/CheckBoxInput/index.jsx';
import { api } from '../config/api';

export const ClassesForm = () => {
	const [familyGroupForm, setfamilyGroupForm] = useState({
		name: '',
		userId: sessionStorage.getItem('UserId'),
		userRole: null,
		groupType: 'CLASS',
	});
	const [dependents, setDependents] = useState([]);
	const [allDependents, setAllDependents] = useState([]);
	const [errorMessages, setErrorMessages] = useState({
		name: null,
	});
	// const [dependentCount, setDependentCount] = useState(1);

	const [allUsers, setAllUsers] = useState([]);
	const [users, setUsers] = useState([]);

	const [submit, setSubmit] = useState(false);

	const getAllUsers = (role) => {
		api.get('/user?role='+ role).then((res) => {
			const usersResponse = res.data;
			res.data.forEach((x) => {
				delete x.groups;
				delete x.relations;
				delete x.role;
			});
			setAllUsers(usersResponse);
		});
	};

	const getAllDependents = () => {
		api.get('/dependent').then((res) => {
			setAllDependents(res.data);
		});
	};

	useEffect(() => {
		clearValidationFields();
		getAllUsers('TEACHER');
		getAllDependents();
	}, []);

	useEffect(() => {
		console.log('Dependents', dependents);
	}, [dependents]);

	const navigate = useNavigate();

	useEffect(() => {
		if (submit) {
			const newErrors = validateForm();
			let isValid = true;
			Object.values(newErrors).forEach((errors) => {
				if (errors !== null) {
					isValid = false;
				}
			});

			if (isValid) {
				const newFamilyGroup = { ...familyGroupForm, dependents, users };
				api
					.post('/group-user-dependent', newFamilyGroup)
					.then(() => {
						navigate('/Classes');
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

	// const updateDependent = (newDependent, index) => {
	// 	setDependents((ps) => {
	// 		if (index >= 0 && index < ps.length) {
	// 			ps[index] = newDependent;
	// 		} else {
	// 			ps.push(newDependent);
	// 		}
	// 		return [...ps];
	// 	});
	// };

	return (
		<div className="app">
			<div className="container my-5 text-center custom-card">
				<h1 className="secondary-color">Olá!</h1>
				<p>Vamos iniciar o cadastro da Turma</p>
				<div className="row text-start">
					<div className="col-12">
						<div className="mt-3">
							<TextualInput
								placeholder="Nome"
								label="Nome da turma"
								value={familyGroupForm.name}
								onChange={(e) => updateForm('name', e)}
							/>
							{showErrorMessages('name')}
							<h5 className="text-center mt-5 text-secondary">Cadastro de professores</h5>
							<h6 className="p text-center text-muted">Selecione os professores que fazem parte desta turma </h6>
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
									<CustomLink text="Cadastrar Novo Professor + " to="/signup" />
								</div>
							</div>
							<h5 className="text-center mt-5 text-secondary">Cadastro de aluno(s)</h5>
							<h6 className="p text-center text-muted">Acrescente os alunos desta turma</h6>
							<div className="mb-3 text-start">
								{allDependents.map((dependent) => (
									<CheckBoxInput
										key={dependent.id}
										value={dependent.name}
										onChange={(e) => {
											if (e.target.checked) {
												setDependents([...dependents, dependent]);
											} else {
												setDependents(dependents.filter((dependentInList) => dependentInList !== dependent.id));
											}
										}}
									/>
								))}
							</div>
							<Button onClick={submitFamilyGroupForm} text="Finalizar Cadastro" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
