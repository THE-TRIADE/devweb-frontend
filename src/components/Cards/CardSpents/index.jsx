import PropTypes from 'prop-types';
import '../styles.css';

export const CardSpents = ({ spent }) => {
	return (
		<div className="col-12 col-md-4 mb-3 mb-md-0 mt-3">
			<a href="" className="text-decoration-none">
				<div className="card h-100">
					<div className="card-header text-center">
						<h5 className="text-primary fw-bold">{spent.name}</h5>
					</div>
					<div className="card-body">
						<h5 className="card-title text-primary">Dependente:</h5>
						<p>{spent.dependentName}</p>
						<h5 className="card-title text-primary">Valor gasto:</h5>
						<p>{spent.value}</p>
						<h5 className="card-title text-primary">Pago em:</h5>
						<p>{spent.paidOn}</p>
						<h5 className="card-title text-primary">Responsável:</h5>
						<p>{spent.guardianName}</p>
						{spent.activityId !== null && (
							<>
								<h5 className="card-title text-primary">Atividade Relacionada:</h5>
								<p>{spent.activityName}</p>
							</>
						)}
					</div>
				</div>
			</a>
		</div>
	);
};

CardSpents.propTypes = {
	spent: PropTypes.object.isRequired,
};
