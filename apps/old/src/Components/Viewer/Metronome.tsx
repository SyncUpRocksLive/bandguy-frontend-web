interface IProps {
	tick: number;
}

export const Metronome = ({tick}: IProps) => {
	return (
		<>METRO {tick}</>
	)
}
