import {useState, useEffect, Fragment} from 'react';
// import { api } from '../config/api';
import { api } from '../config/api';
import { Menu } from '../components/Menu';
import { ButtonAction } from '../components/ButtonAction';
import {verifyPermission} from "../utils/permissions.js";

export const SpentsReports = () => {
	const [spents, setSpents] = useState([]);
	const [spentsPrincipal, setSpentsPrincipal] = useState([]);
	const [dependents, setDependents] = useState([]);
	const [dependentsPrincipal, setDependentsPrincipal] = useState([]);
	const [permissionTypeV, setPermissionTypeV] = useState('NONE');

	const role = sessionStorage.getItem('role');
	useEffect(() => {;
		const hasWritePermissionV = verifyPermission(role, 'LISTAR TODOS GASTO', true);
		const hasReadPermissionV  = verifyPermission(role, 'LISTAR TODOS GASTO');

		if (hasWritePermissionV) {
			setPermissionTypeV('READ/WRITE');
		} else if (hasReadPermissionV) {
			setPermissionTypeV('READ-ONLY');
		} else {
			setPermissionTypeV('NONE');
		}
	}, []);
	const printWindow = () => {
		window.print();
	};
	useEffect(() => {
		const getSpents = () => {
			api.get('/spent/by-user-id/' + sessionStorage.getItem('UserId')).then((res) => {
				setSpents(res.data);
			});
		};
		const getSpentsPrincipal = () => {
			api.get('/spent').then((res) => {
				setSpentsPrincipal(res.data);
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
		const getDependentsPrincipal = () => {
			api.get('/dependent').then((res) => {
				setDependentsPrincipal(res.data);
			});
		};
		getSpents();
		getSpentsPrincipal();
		getDependents();
		getDependentsPrincipal()
	}, []);

	return (
		<div className="container">
			<Menu />
			<div className="row">
				<div className="col-12">
					<div className="my-5 pt-5 d-flex flex-column flex-sm-row justify-content-between">
						<h3 className="pt-3 ">Resumo de Gastos por Estudante</h3>
						<div className="hide-print">
							<ButtonAction bgColor="bg-info" text="Imprimir Resumo" onClick={printWindow} />
						</div>
					</div>
					{permissionTypeV != 'NONE' ?
						<div className="row">
							{dependentsPrincipal.map((dependent) => {
								return (
									<Fragment key={dependent.id}>
										<h5 className="text-secondary pb-2">{dependent.name}</h5>
										<div className="table-responsive">
											<table className="table table-striped table-light table-bordered">
												<thead>
												<tr>
													<th scope="col">Nome</th>
													<th scope="col">Valor</th>
													<th scope="col">Pago Em</th>
													<th scope="col">Responsável</th>
												</tr>
												</thead>
												<tbody>
												{spentsPrincipal.filter(spent => dependent.id === spent.dependentId).map((spent) => {
													return (
														<tr key={spent.id}>
															<td>{spent.name}</td>
															<td>R$ {(spent.value / 100).toFixed(2).replace('.', ',')}</td>
															<td>{new Date(spent.paidOn).toLocaleDateString("pt-BR", { dateFormat: "short", timeZone: "UTC" })}</td>
															<td>{spent.userName}</td>
														</tr>
													);
												})}
												</tbody>
											</table>
										</div>
										<p className="text-end">
											Total:{' '}
											<span>
											R$ {(spentsPrincipal.reduce((acc, spent) => {
												if (dependent.id === spent.dependentId) {
													return acc + spent.value;
												}
												return acc;
											}, 0) / 100).toFixed(2).replace('.', ',')}

										</span>
										</p>
									</Fragment>
								);
							})}
						</div>
						:
						<div className="row">
							{dependents.map((dependent) => {
								return (
									<Fragment key={dependent.id}>
										<h5 className="text-secondary pb-2">{dependent.dependentName}</h5>
										<div className="table-responsive">
											<table className="table table-striped table-light table-bordered">
												<thead>
												<tr>
													<th scope="col">Nome</th>
													<th scope="col">Valor</th>
													<th scope="col">Pago Em</th>
													<th scope="col">Responsável</th>
												</tr>
												</thead>
												<tbody>
												{spents.filter(spent => dependent.dependentId === spent.dependentId).map((spent) => {
													return (
														<tr key={spent.id}>
															<td>{spent.name}</td>
															<td>R$ {(spent.value / 100).toFixed(2).replace('.', ',')}</td>
															<td>{new Date(spent.paidOn).toLocaleDateString("pt-BR", { dateFormat: "short", timeZone: "UTC" })}</td>
															<td>{spent.userName}</td>
														</tr>
													);
												})}
												</tbody>
											</table>
										</div>
										<p className="text-end">
											Total:{' '}
											<span>
											R$ {(spents.reduce((acc, spent) => {
												if (dependent.dependentId === spent.dependentId) {
													return acc + spent.value;
												}
												return acc;
											}, 0) / 100).toFixed(2).replace('.', ',')}

										</span>
										</p>
									</Fragment>
								);
							})}
						</div>
					}
				</div>
			</div>
		</div>
	);
};
