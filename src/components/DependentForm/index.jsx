import { useState, useEffect } from 'react';
import { DateInput } from '../Inputs/DateInput';
// import { CpfInput } from '../Inputs/CpfInput';
import { TextualInput } from '../Inputs/TextualInput';
import { ButtonOutline } from '../ButtonOutline';
import PropTypes from 'prop-types';
export const DependentForm = ({ counter, updateDependent, updateDependentCount }) => {
	const [dependent, setDependent] = useState({
		name: '',
		birthDate: '',
		race: '',
	});

	const updateForm = (inputName, event) => {
		setDependent((prevState) => {
			return { ...prevState, [inputName]: event.target.value };
		});
	};

	useEffect(() => {
		const newDependent = { ...dependent };
		updateDependent(newDependent, counter - 1);
	}, [dependent]);

	return (
		<>
			<div className="pt-4 d-flex flex-row justify-content-between">
				<b className="text-start h5 pt-2">Pet {counter}</b>
				{counter > 1 && <ButtonOutline onClick={() => updateDependentCount((ps) => ps - 1)} text="Excluir" />}
			</div>
			<TextualInput
				placeholder="Nome"
				label="Nome do pet"
				value={dependent.name}
				onChange={(e) => updateForm('name', e)}
			/>
			<TextualInput
				placeholder="Raça"
				label="Raça do pet"
				value={dependent.race}
				onChange={(e) => updateForm('race', e)}
			/>
			<DateInput
				label="Data de Nascimento"
				placeholder="00/00/0000"
				value={dependent.birthDate}
				onChange={(e) => updateForm('birthDate', e)}
			/>
		</>
	);
};

DependentForm.propTypes = {
	counter: PropTypes.number.isRequired,
	updateDependentCount: PropTypes.func.isRequired,
	updateDependent: PropTypes.func.isRequired,
};
