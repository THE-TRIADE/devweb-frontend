import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { CustomSpan } from '../components/CustomSpan';
import { TextualInput } from '../components/Inputs/TextualInput';

import { api } from '../config/api';
import { ButtonOutline } from '../components/ButtonOutline';
import { DependentForm } from '../components/DependentForm';
import { useNavigate } from 'react-router-dom';
import { guardianRoleEnum } from './ManageGuardians';
import { SelectInput } from '../components/Inputs/SelectInput';
import {CheckBoxInput} from "../components/Inputs/CheckBoxInput/index.jsx";
import {ButtonOutlineSecondary} from "../components/ButtonOutlineSecondary/index.jsx";
import {CustomLink} from "../components/CustomLink/index.jsx";

export const ClassesForm = () => {
	const [familyGroupForm, setfamilyGroupForm] = useState({
		name: '',
		userId: sessionStorage.getItem('UserId'),
		userRole: '-1',
	});
	const [dependents, setDependents] = useState([]);
	const [students, setStudents] = useState([]);
	const [errorMessages, setErrorMessages] = useState({
		name: null,
	});
	const [dependentCount, setDependentCount] = useState(1);
	const [submit, setSubmit] = useState(false);
	const [guardians, setGuardians] = useState([]);
	const [selectedGuardians, setSelectedGuardians] = useState([]);
	const [selectedStudents, setSelectedStudents] = useState([]);
	const getGuardians = () => {
		api.get('/user').then((res) => {
			setGuardians(res.data);
		});
	};
	getGuardians();
	const getStudents = () => {
		api.get('/dependent').then((res) => {
			setStudents(res.data);
		});
	};
	getStudents();
	useEffect(() => {
		clearValidationFields();
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
			Object.values(newErrors).forEach((errors) => {
				if (errors !== null) {
					isValid = false;
				}
			});

			if (isValid) {
				const newFamilyGroup = { ...familyGroupForm, dependents };
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
							{guardians.map((guardian) => (
								<CheckBoxInput
									key={guardian.id}
									value={guardian.name}
									onChange={(e) => {
										if (e.target.checked) {
											setSelectedGuardians([...selectedGuardians, guardian.id]);
										} else {
											setSelectedGuardians(selectedGuardians.filter((id) => id !== guardian.id));
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
								{students.map((student) => (
									<CheckBoxInput
										key={student.id}
										value={student.name}
										onChange={(e) => {
											if (e.target.checked) {
												setSelectedStudents([...setSelectedStudents, student.id]);
											} else {
												setSelectedStudents(setSelectedStudents.filter((id) => id !== student.id));
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
