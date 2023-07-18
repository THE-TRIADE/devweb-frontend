import {Fragment, useState} from 'react';
import { api } from '../config/api';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TitlePages } from '../components/TitlePages';
import { AccordionActivities } from '../components/AccordionItemActivities';
import { Menu } from '../components/Menu';
import { TextualInput } from '../components/Inputs/TextualInput';
import { DateInput } from '../components/Inputs/DateInput';
import { TimeInput } from '../components/Inputs/TimeInput';
import { SelectInput } from '../components/Inputs/SelectInput';
import { CheckBoxInput } from '../components/Inputs/CheckBoxInput';
import { CheckBoxGroupInput } from '../components/Inputs/CheckBoxGroupInput';
import { dayOfWeekEnum } from './ManageGuardians';
import { Button } from '../components/Button';
import {verifyPermission} from "../utils/permissions.js";
export const ActivityStateEnum = {
	created: 'CRIADA',
	in_progress: 'EM_ANDAMENTO',
	late: 'ATRASADA',
	done: 'REALIZADA',
	not_done: 'NAO_REALIZADA',
};

const getActivities = (dependentId) => {
	return api.get('/activity', { params: { dependentId } }).then((res) => {
		return res.data;
	});
};

const getDependent = (dependentId) => {
	return api.get('/dependent/' + dependentId).then((res) => {
		return res.data;
	});
};

const getGuardiansByDependentId = (dependentId) => {
	return api.get('/relation/by-dependent-id/' + dependentId).then((res) => {
		return res.data.map((guard) => ({ id: guard.userId, name: guard.userName }));
	});
};

export const DependentActivitiesFamilyGroup = () => {
	const { id } = useParams();
	const [activities, setActivities] = useState([]);
	const [categories, setCategories] = useState([]);
	const [dependent, setDependent] = useState({});
	const [guardians, setGuardians] = useState([]);
	const [submitActivity, setSubmitActivity] = useState(false);
	const [sentForm, setSentForm] = useState({
		name: '',
		dateStart: '',
		hourStart: '',
		dateEnd: '',
		hourEnd: '',
		dependentId: id,
		currentUser: '-1',
		actor: '-1',
		grade: '',
		createdBy: sessionStorage.getItem('UserId'),
		repeat: false,
		daysToRepeat: [],
		repeatUntil: '',
		courseId: '-1',
	});
	const [submitCourse, setSubmitCourse] = useState(false);
	const [sentCourse, setSentCourse] = useState({
		name: '',
	});
	const [finishActivityId, setFinishActivityId] = useState(0);
	const [sentFinishForm, setSentFinishForm] = useState({
		userId: sessionStorage.getItem('UserId'),
		done: false,
		commentary: '',
	});
	const [trySubmitFinishForm, setTrySubmitFinishForm] = useState(false);
	const [permissionCategoriaType, setPermissionCategoriaType] = useState('NONE');
	const [permissionAtividadeType, setPermissionAtividadeType] = useState('NONE');

	const role = sessionStorage.getItem('role');
	useEffect(() => {
		const hasWritePermissionCategoria = verifyPermission(role, 'CATEGORIA', true);
		const hasReadPermissionCategoria = verifyPermission(role, 'CATEGORIA');
		const hasWritePermissionAtividade = verifyPermission(role, 'ATIVIDADE', true);
		const hasReadPermissionAtividade = verifyPermission(role, 'ATIVIDADE');

		if (hasWritePermissionCategoria) {
			setPermissionCategoriaType('READ/WRITE');
		} else if (hasReadPermissionCategoria) {
			setPermissionCategoriaType('READ-ONLY');
		} else {
			setPermissionCategoriaType('NONE');
		}

		if (hasWritePermissionAtividade) {
			setPermissionAtividadeType('READ/WRITE');
		} else if (hasReadPermissionAtividade) {
			setPermissionAtividadeType('READ-ONLY');
		} else {
			setPermissionAtividadeType('NONE');
		}
	}, []);
	const updateForm = (inputName, event) => {
		const { checked, value } = event.target;

		setSentForm((prevState) => {
			if (inputName == 'repeat') {
				return { ...prevState, [inputName]: checked };
			} else {
				return { ...prevState, [inputName]: value };
			}
		});
	};
	const updateFormCourse = (inputName, event) => {
		const { checked, value } = event.target;

		setSentCourse((prevState) => {
				return { ...prevState, [inputName]: value };
		});
	};
	const getActivitiesByCategoryIdDependentId = (dependentId,courseId) => {
		api.get('/activity/by-dependent-id/'+ dependentId + '/by-course-id/' + courseId)
			.then((res) => {
				setActivities(res.data)
			})
	};
	const updateFinishForm = (inputName, event) => {
		const { checked, value } = event.target;

		setSentFinishForm((prevState) => {
			if (inputName == 'done') {
				return { ...prevState, [inputName]: checked };
			} else {
				return { ...prevState, [inputName]: value };
			}
		});
	};

	const getCategories = () => {
		api.get('/course').then((res) => {
			setCategories(res.data);
		});
	};

	useEffect(() => {
		getDependent(id).then((dependentResult) => {
			setDependent(dependentResult);
		});
		getGuardiansByDependentId(id).then((guardiansResult) => {
			const guardiansDisjuction = guardiansResult.filter(
				(guardian, index, self) => index === self.findIndex((g) => g.id === guardian.id),
			);
			setGuardians(guardiansDisjuction);
		});
		getActivities(id).then((activities) => {
			setActivities(activities);
		});
	}, [id]);
	useEffect(() => {
		getCategories();
	}, []);
	useEffect(() => {
		if (submitActivity) {
			const newActivity = { ...sentForm };
			if (!newActivity.repeat) {
				newActivity.daysToRepeat = [];
				newActivity.repeatUntil = null;
			}
			api
				.post('/activity', newActivity)
				.then((res) => {
					setActivities((oldList) => {
						const newArray = oldList;
						if (!oldList.includes(res.data)) {
							newArray.push(res.data);
						}
						return newArray;
					});
				})
				.catch((err) => console.error(err))
				.finally(() => {
					setSentForm({
						name: '',
						dateStart: '',
						hourStart: '',
						dateEnd: '',
						hourEnd: '',
						dependentId: id,
						currentUser: '-1',
						actor: '-1',
						grade: '',
						createdBy: sessionStorage.getItem('UserId'),
						repeat: false,
						daysToRepeat: [],
						repeatUntil: '',
						courseId:'',
					});

					setSubmitActivity(false);
				});
		}
	}, [submitActivity]);
	useEffect(() => {
		if (submitCourse) {
			const newCourse = { ...sentCourse};
			api
				.post('/course', newCourse)
				.then((res) => getCategories())
				.catch((err) => console.error(err))
				.finally(() => {
					setSentCourse({
						name: '',
					});
					setSubmitCourse(false);
				});
		}
	}, [submitCourse]);
	const submitActivityForm = () => {
		setSubmitActivity(true);
	};
	const submitCourseForm = () => {
		setSubmitCourse(true);
	};
	const deleteActivityFunction = (e, activityId) => {
		e.preventDefault();
		api.delete(`/activity/${activityId}`).then(() => {
			setActivities((oldList) => oldList.filter((activity) => activity.id != activityId));
		});
	};

	const deleteCourseFunction = (e, courseId) => {
		e.preventDefault();
		api.delete(`/course/${courseId}`).then(() => {
			setCategories((oldList) => oldList.filter((category) => category.id != courseId));
		});
	};

	useEffect(() => {
		if (trySubmitFinishForm) {
			console.log(sentFinishForm);
			api
				.patch(`/activity/${finishActivityId}/finish`, sentFinishForm)
				.then((res) => {
					console.log(res);
					setActivities((oldList) => {
						const indexActivity = oldList.findIndex((activity) => activity.id == finishActivityId);
						oldList[indexActivity] = res.data;
						return [...oldList];
					});
				})
				.catch((err) => console.error(err))
				.finally(() => {
					setTrySubmitFinishForm(false);
					setSentFinishForm({
						userId: sessionStorage.getItem('UserId'),
						done: false,
						commentary: '',
					});
				});
		}
	}, [trySubmitFinishForm]);

	const finishActivityFunction = (e) => {
		e.preventDefault();
		setTrySubmitFinishForm(true);
	};

	const setActivityToSendFinish = (finishActivityIdToSet) => {
		setFinishActivityId(finishActivityIdToSet);
	};

	return (
		<div className="app">
			<Menu />
			<div className="container">
				<div className="row">

					{!!dependent && (
						<h3 className="pt-5 my-5">Atividades de {dependent.name}</h3>
					)}
					<SelectInput
						options={[
							{ optName: 'Escolha uma disciplina', optValue: '-1', disabled: true },
							...categories.map((category) => {
								return { optName: category.name, optValue: category.id.toString() };
							}),
						]}
						label="Filtrar por Disciplina"
						onChange={(e) => getActivitiesByCategoryIdDependentId(id, e.target.value)}
					/>
					<>
						{/* CONTAGEM DAS ATIVIDADES INICIO */}
						<div className="resumo">
							<h5 className="my-3">Resumo de Atividades</h5>
							<div className="my-2">
								<span className="badge rounded-pill bg-info">{ActivityStateEnum.created}</span>
								<span className="p fw-bold text-info"> Criadas: </span>
								<span className="text-dark">
									{activities.filter((activity) => activity.state === 'CREATED').length}
								</span>
							</div>
							<div className="my-2">
								<span className="badge rounded-pill bg-warning">{ActivityStateEnum.in_progress}</span>
								<span className="p fw-bold text-warning"> Em Andamento: </span>
								<span className="text-dark">
									{activities.filter((activity) => activity.state === 'IN_PROGRESS').length}
								</span>
							</div>
							<div className="my-2">
								<span className="badge rounded-pill bg-danger">{ActivityStateEnum.late}</span>
								<span className="p fw-bold text-danger"> Atrasadas: </span>
								<span className="text-dark">{activities.filter((activity) => activity.state === 'LATE').length}</span>
							</div>
							<div className="my-2">
								<span className="badge rounded-pill bg-success">{ActivityStateEnum.done}</span>
								<span className="p fw-bold text-success"> Realizadas: </span>
								<span className="text-dark">{activities.filter((activity) => activity.state === 'DONE').length}</span>
							</div>
							<div className="my-2">
								<span className="badge rounded-pill bg-secondary">{ActivityStateEnum.not_done}</span>
								<span className="p fw-bold text-black-50"> Não Realizadas: </span>
								<span className="text-dark">
									{activities.filter((activity) => activity.state === 'NOT_DONE').length}
								</span>
							</div>
						</div>
						{/* CONTAGEM DAS ATIVIDADES FIM */}

						{/* LISTAGEM DAS ATIVIDADES INICIO */}
						<div className="">
							{!!activities.filter((activity) => activity.state === 'IN_PROGRESS').length && (
								<>
									<h4 className="my-4 text-warning">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="lucide lucide-alarm-clock"
										>
											<circle cx="12" cy="13" r="8" />
											<path d="M12 9v4l2 2" />
											<path d="M5 3 2 6" />
											<path d="m22 6-3-3" />
											<path d="M6.38 18.7 4 21" />
											<path d="M17.64 18.67 20 21" />
										</svg>
										<span className="ps-3 ">Em Andamento</span>
									</h4>
									<div className="accordion pb-3" id="accordionEmAndamento">
										{activities
											.filter((activity) => activity.state === 'IN_PROGRESS')
											.map((activity) => (
												<AccordionActivities
													key={activity.id}
													activity={activity}
													parent="#accordionEmAndamento"
													deleteFunction={deleteActivityFunction}
													target="#ModalFinishActivity"
													funcOnClickFinish={setActivityToSendFinish}
												/>
											))}
									</div>
								</>
							)}
							{!!activities.filter((activity) => activity.state === 'CREATED').length && (
								<>
									<h4 className="my-4 text-info">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="lucide lucide-edit"
										>
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
											<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
										</svg>
										<span className="ps-3">Criadas</span>
									</h4>
									<div className="accordion pb-3" id="accordionCriadas">
										{activities
											.filter((activity) => activity.state === 'CREATED')
											.map((activity) => (
												<AccordionActivities
													key={activity.id}
													activity={activity}
													parent="#accordionCriadas"
													deleteFunction={deleteActivityFunction}
													target="#ModalFinishActivity"
													funcOnClickFinish={setActivityToSendFinish}
												/>
											))}
									</div>
								</>
							)}
							{!!activities.filter((activity) => activity.state === 'LATE').length && (
								<>
									<h4 className="my-4 text-danger">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="lucide lucide-alarm-clock-off"
										>
											<path d="M6.87 6.87a8 8 0 1 0 11.26 11.26" />
											<path d="M19.9 14.25a8 8 0 0 0-9.15-9.15" />
											<path d="m22 6-3-3" />
											<path d="M6.26 18.67 4 21" />
											<path d="m2 2 20 20" />
											<path d="M4 4 2 6" />
										</svg>
										<span className="ps-3 ">Atrasadas</span>
									</h4>
									<div className="accordion pb-3" id="accordionAtrasadas">
										{activities
											.filter((activity) => activity.state === 'LATE')
											.map((activity) => (
												<AccordionActivities
													key={activity.id}
													activity={activity}
													parent="#accordionAtrasadas"
													deleteFunction={deleteActivityFunction}
													target="#ModalFinishActivity"
													funcOnClickFinish={setActivityToSendFinish}
												/>
											))}
									</div>
								</>
							)}
							{!!activities.filter((activity) => activity.state === 'DONE').length && (
								<>
									<h4 className="my-4 text-success">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="lucide lucide-check-square"
										>
											<polyline points="9 11 12 14 22 4" />
											<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
										</svg>
										<span className="ps-3 ">Realizadas</span>
									</h4>
									<div className="accordion pb-3" id="accordionRealizadas">
										{activities
											.filter((activity) => activity.state === 'DONE')
											.map((activity) => (
												<AccordionActivities
													key={activity.id}
													activity={activity}
													parent="#accordionRealizadas"
													deleteFunction={deleteActivityFunction}
												/>
											))}
									</div>
								</>
							)}
							{!!activities.filter((activity) => activity.state === 'NOT_DONE').length && (
								<>
									<h4 className="my-4 text-black-50">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="lucide lucide-x-square"
										>
											<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
											<path d="m15 9-6 6" />
											<path d="m9 9 6 6" />
										</svg>
										<span className="ps-3 ">Não Realizadas</span>
									</h4>
									<div className="accordion pb-3" id="accordionNaoRealizadas">
										{activities
											.filter((activity) => activity.state === 'NOT_DONE')
											.map((activity) => (
												<AccordionActivities
													key={activity.id}
													activity={activity}
													parent="#accordionNaoRealizadas"
													deleteFunction={deleteActivityFunction}
												/>
											))}
									</div>
								</>
							)}
						</div>
						{/* LISTAGEM DAS ATIVIDADES FIM */}
					</>
				</div>
				{/* MODAL DE FINISH ACTIVITY INICIO */}
				{!!activities.length && (
					<div
						className="modal fade"
						id="ModalFinishActivity"
						data-bs-backdrop="static"
						data-bs-keyboard="false"
						tabIndex="-1"
						aria-labelledby="ModalFinishActivity"
						aria-hidden="true"
					>
						<div className="modal-dialog modal-dialog-centered">
							<div className="modal-content">
								<div className="modal-header">
									<h1 className="modal-title fs-5 secondary-color" id="ModalFinishActivityLabel">
										Finalizar Atividade
									</h1>
									<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
								</div>
								<div className="modal-body">
									<CheckBoxInput
										label="Atividade foi realizada?"
										value={'Atividade foi realizada'}
										checked={sentFinishForm.done}
										onChange={(e) => updateFinishForm('done', e)}
									/>
									{permissionAtividadeType == 'READ/WRITE' && (
										<TextualInput
											placeholder="Nota"
											label="Nota da Atividade"
											value={sentFinishForm.grade}
											onChange={(e) => updateFinishForm('grade', e)}
										/>
									)}
									<TextualInput
										placeholder="Comentário"
										label="Comentário"
										value={sentFinishForm.commentary}
										onChange={(e) => updateFinishForm('commentary', e)}
									/>
								</div>
								<div className="modal-footer" data-dismiss="ModalFinishActivity">
									<Button type="button" text="Cadastrar" onClick={(e) => finishActivityFunction(e)} />
								</div>
							</div>
						</div>
					</div>
				)}
				{/* MODAL DE FINISH ACTIVITY FIM */}
				{/* MODAL DE GERENCIAR ACTIVITY INICIO */}
				{!!activities.length && (
					<div
						className="modal fade"
						id="ModalGerenciarAtividades"
						data-bs-backdrop="static"
						data-bs-keyboard="false"
						tabIndex="-1"
						aria-labelledby="ModalGerenciarAtividades"
						aria-hidden="true"
					>
						<div className="modal-dialog modal-dialog-centered">
							<div className="modal-content">
								<div className="modal-header">
									<h1 className="modal-title fs-5 secondary-color" id="ModalGerenciarAtividadesLabel">
										Disciplinas
									</h1>
									<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
								</div>
								<div className="modal-body">
									<div className="row">
													<div className="table-responsive">
														<table className="table">
															<thead>

															<tr>
																<th scope="col">Disciplina</th>
																{permissionCategoriaType != 'READ-ONLY' && (
																	<th scope="col">Ação</th>
																)}
															</tr>
															</thead>
															<tbody>
															{categories.map((category) => {
																return (
																	<tr key={category.id}>
																		<td>{category.name}</td>
																		{permissionCategoriaType != 'READ-ONLY' && (
																			<td><a className="text-danger fw-bold text-decoration-none" onClick={(e) => deleteCourseFunction(e, category.id)} role="button">Excluir</a></td>
																		)}
																	</tr>
																);
															})}
															</tbody>
														</table>
													</div>
									</div>
									{permissionCategoriaType != 'READ-ONLY' && (
										<div className="text-end">
										<button className="buttonHeader my-2 bg-info" data-bs-toggle="modal"
														data-bs-target="#ModalCadastrarCategoria">Cadastrar Disciplina
										</button>
									</div>
									)}
								</div>
							</div>
						</div>
					</div>
				)}
				{/* MODAL DE GERENCIAR ACTIVITY FIM */}
				{/* MODAL DE CADASTRAR CATEGORIA INICIO */}
				{!!activities.length && (
					<div
						className="modal fade"
						id="ModalCadastrarCategoria"
						data-bs-backdrop="static"
						data-bs-keyboard="false"
						tabIndex="-1"
						aria-labelledby="ModalCadastrarCategoriaAtividades"
						aria-hidden="true"
					>
						<div className="modal-dialog modal-dialog-centered">
							<div className="modal-content">
								<div className="modal-header">
									<h1 className="modal-title fs-5 secondary-color" id="ModalGerenciarAtividadesLabel">
										Cadastrar Disciplina
									</h1>
									<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
								</div>
								<div className="modal-body">
									<TextualInput
										placeholder="Nome"
										label="Nome da Disciplina"
										value={sentCourse.name}
										onChange={(e) => updateFormCourse('name', e)}
									/>
								</div>
								<div className="modal-footer">
									<button className="button my-2" onClick={submitCourseForm}>Cadastrar</button>
								</div>
							</div>
						</div>
					</div>
				)}
				{/* MODAL DE CADASTRAR CATEGORIA  FIM */}
				{/* MODAL CADASTRO DE ATIVIDADE INICIO */}
				{!!dependent && !!guardians.length && (
					<div
						className="modal fade"
						id="ModalCadastrarAtividades"
						data-bs-backdrop="static"
						data-bs-keyboard="false"
						tabIndex="-1"
						aria-labelledby="ModalCadastrarAtividadesLabel"
						aria-hidden="true"
					>
						<div className="modal-dialog modal-dialog-centered">
							<div className="modal-content">
								<div className="modal-header">
									<h1 className="modal-title fs-5 secondary-color" id="ModalCadastrarAtividadesLabel">
										Cadastrar Nova Atividade
									</h1>
									<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
								</div>
								<div className="modal-body">
									<TextualInput
										placeholder="Título da atividade"
										label="Título da Atividade"
										value={sentForm.name}
										onChange={(e) => updateForm('name', e)}
									/>
									<DateInput
										placeholder=""
										label="Data de início"
										value={sentForm.dateStart}
										onChange={(e) => updateForm('dateStart', e)}
									/>
									<TimeInput
										placeholder=""
										label="Hora de início"
										value={sentForm.hourStart}
										onChange={(e) => updateForm('hourStart', e)}
									/>
									<DateInput
										placeholder=""
										label="Data de fim"
										value={sentForm.dateEnd}
										onChange={(e) => updateForm('dateEnd', e)}
									/>
									<TimeInput
										placeholder=""
										label="Hora de fim"
										value={sentForm.hourEnd}
										onChange={(e) => updateForm('hourEnd', e)}
									/>
									<SelectInput
										options={[
											{ optName: 'Escolha um responsável', optValue: '-1', disabled: true },
											...guardians.map((guardian) => {
												return { optName: guardian.name, optValue: guardian.id.toString() };
											}),
										]}
										value={sentForm.currentUser}
										label="Responsável atual"
										onChange={(e) => updateForm('currentUser', e)}
									/>
									<SelectInput
										options={[
											{ optName: 'Escolha uma disciplina', optValue: '-1', disabled: true },
											...categories.map((category) => {
												return { optName: category.name, optValue: category.id.toString() };
											}),
										]}
										value={sentForm.courseId}
										label="Disciplina"
										onChange={(e) => updateForm('courseId', e)}
									/>
									<SelectInput
										options={[
											{ optName: 'Escolha um ator da atividade', optValue: '-1', disabled: true },
											...[...guardians, dependent].map((person) => ({
												optName: person.name,
												optValue: person.id.toString(),
											})),
										]}
										value={sentForm.actor}
										label="Ator da atividade"
										onChange={(e) => updateForm('actor', e)}
									/>
									<CheckBoxInput
										label="Repetir atividade"
										value="Deseja repetir atividade em outros dias?"
										checked={sentForm.repeat}
										onChange={(e) => updateForm('repeat', e)}
									/>
									{sentForm.repeat && (
										<>
											<CheckBoxGroupInput
												label="Dias da semana que irão repetir"
												options={dayOfWeekEnum}
												onChange={(e) => updateForm('daysToRepeat', e)}
											/>
											<DateInput
												placeholder=""
												label="Repetir até"
												value={sentForm.repeatUntil}
												onChange={(e) => updateForm('repeatUntil', e)}
											/>
										</>
									)}
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-primary" onClick={submitActivityForm}>
										Cadastrar
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
				{/* MODAL CADASTRO DE ATIVIDADE FIM */}
			</div>
		</div>
	);
};