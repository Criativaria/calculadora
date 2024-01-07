import styled from 'styled-components';
import { useEffect, useState } from 'react';
import './App.css'

export default function App() {

    const [chave, setChave] = useState('');

    function aiseila(e) {
        setChave(e.code);
    }

    useEffect(() => {
        window.addEventListener("keydown", aiseila)
    }, [])
    return (
        <Body >
            <p>A chave é: {chave}</p>
        </Body>
    )
}

const Body = styled.div`
  width: 100vw;
  height: 100vh;
`


