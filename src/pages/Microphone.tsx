import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Microphone() {
    const navigate = useNavigate();
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px'
        }}>
            <h1>Microfone</h1>
            <Button onClick={() => navigate('/components')}>Voltar</Button>
        </div>
    );
}