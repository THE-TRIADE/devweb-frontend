import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { ButtonOutline } from '../ButtonOutline';
import { CpfInput } from '../Inputs/CpfInput';
import { TextualInput } from '../Inputs/TextualInput';
export const DependentForm = ({ counter, updateDependent, updateDependentCount }) => {
	const [dependent, setDependent] = useState({
		name: '',
		registrationNumber: '',
		cpf: '',
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
				<b className="text-start h5 pt-2">Dependente {counter}</b>
				{counter > 1 && <ButtonOutline onClick={() => updateDependentCount((ps) => ps - 1)} text="Excluir" />}
			</div>
			<TextualInput
				placeholder="Nome"
				label="Nome do dependente"
				value={dependent.name}
				onChange={(e) => updateForm('name', e)}
			/>
			<TextualInput
				placeholder="Matrícula"
				label="Matrícula do dependente"
				value={dependent.registrationNumber}
				onChange={(e) => updateForm('registrationNumber', e)}
			/>
			<CpfInput
				placeholder="CPF"
				label="CPF do dependente"
				value={dependent.cpf}
				onChange={(e) => updateForm('cpf', e)}
			/>
		</>
	);
};

DependentForm.propTypes = {
	counter: PropTypes.number.isRequired,
	updateDependentCount: PropTypes.func.isRequired,
	updateDependent: PropTypes.func.isRequired,
};
