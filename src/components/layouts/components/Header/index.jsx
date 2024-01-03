import { HeaderContainer, HeaderLimiter } from './styles';
import { Button } from '../../../Button';
import { Link } from 'react-router-dom';

export const Header = () => {

	return (
		<HeaderContainer>

			<HeaderLimiter>
			<nav>
					<Button
						title={'Upload de Arquivo .txt'}
					/>
				</nav>
				<h2 title='Voltar ao início'>
					<Link to='/home'>
            
					</Link>
				</h2>
				
			</HeaderLimiter>
		</HeaderContainer>
	);
};
