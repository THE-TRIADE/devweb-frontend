import PropTypes from 'prop-types';
import '../styles.css';

export const SelectLoginInput = ({ options, onChange, value, label }) => {
	return (
		<div className="mt-3">
			<select className="loginSelect form-select mt-3 mb-2" value={value} onChange={onChange}>
				{options.map((o) => (
					<option value={o.optValue} key={o.optName} disabled={o.disabled === null ? false : o.disabled}>
						{o.optName}
					</option>
				))}
			</select>
		</div>
	);
};

SelectLoginInput.propTypes = {
	label: PropTypes.string.isRequired,
	options: PropTypes.arrayOf(
		PropTypes.shape({
			optName: PropTypes.string.isRequired,
			optValue: PropTypes.string.isRequired,
			disabled: PropTypes.bool,
		}),
	).isRequired,
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
};
