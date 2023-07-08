import PropTypes from 'prop-types';
import './styles.css';

export const ButtonHeader = ({ text, disabled = false, target, funcOnClick, bgColor }) => {
	return (
		<button
			className={"buttonHeader my-2 " + bgColor}
			data-bs-toggle="modal"
			data-bs-target={target}
			disabled={disabled == null ? false : disabled}
			onClick={funcOnClick == null ? () => {} : funcOnClick}
		>
			{text}
		</button>
	);
};

ButtonHeader.propTypes = {
	text: PropTypes.string.isRequired,
	bgColor: PropTypes.string,
	target: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
	funcOnClick: PropTypes.func,
};
