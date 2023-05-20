import { useState } from 'react';
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
	return api.get('/guard/by-dependent-id/' + dependentId).then((res) => {
		return res.data.map((guard) => ({ id: guard.guardianId, name: guard.guardianName }));
	});
};

export const DependentActivities = () => {
	const { id } = useParams();
	const [activities, setActivities] = useState([]);
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
		currentGuardian: '-1',
		actor: '-1',
		createdBy: sessionStorage.getItem('UserId'),
		repeat: false,
		daysToRepeat: [],
		repeatUntil: '',
	});
	const [finishActivityId, setFinishActivityId] = useState(0);
	const [sentFinishForm, setSentFinishForm] = useState({
		guardianId: sessionStorage.getItem('UserId'),
		done: false,
		commentary: '',
	});
	const [trySubmitFinishForm, setTrySubmitFinishForm] = useState(false);

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
						currentGuardian: '-1',
						actor: '-1',
						createdBy: sessionStorage.getItem('UserId'),
						repeat: false,
						daysToRepeat: [],
						repeatUntil: '',
					});

					setSubmitActivity(false);
				});
		}
	}, [submitActivity]);

	const submitActivityForm = () => {
		setSubmitActivity(true);
	};

	const deleteActivityFunction = (e, activityId) => {
		e.preventDefault();
		api.delete(`/activity/${activityId}`).then(() => {
			setActivities((oldList) => oldList.filter((activity) => activity.id != activityId));
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
					setTrySubmitFinishForm(true);
					setSentFinishForm({
						guardianId: sessionStorage.getItem('UserId'),
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
						<TitlePages
							text={'Atividades de ' + dependent.name}
							textButton="Cadastrar Atividade"
							target="#ModalCadastrarAtividades"
						/>
					)}
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
									<h4 className="my-4 text-warning">Em Andamento</h4>
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
									<h4 className="my-4 text-info">Criadas</h4>
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
									<h4 className="my-4 text-danger">Atrasadas</h4>
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
									<h4 className="my-4 text-success">Realizadas</h4>
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
									<h4 className="my-4 text-black-50">Não Realizadas</h4>
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
										value={sentForm.currentGuardian}
										label="Responsável atual"
										onChange={(e) => updateForm('currentGuardian', e)}
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
									<button type="button" className="btn btn-secondary" onClick={submitActivityForm}>
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
