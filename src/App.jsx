import styled from "styled-components"
import { Delete, Plus, Minus, Equal, X, Divide } from "lucide-react";
import { useEffect, useState } from "react";
// import Falar from "./components/falar";

//LISTA DE COISAS PARA RESOLVER
//inserir os numeros pelo teclado

function App() {
  const [isResult, setIsResult] = useState(false);
  //logica do teclado
  var expressao = [];
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const [numeros, setNumeros] = useState([]);
  useEffect(() => {
    const key = (e) => {
      if (numbers.includes(e.key) || operadores.includes(e.key) || e.key == '.' || e.code == 'KeyC' || e.key == 'Backspace' || e.key == 'Enter') {
        if (e.code == 'KeyC') {
          limpar()
          return;
        } if (e.key == 'Backspace') {
          apagar()
          return;
        } if (e.key == 'Enter') {
          setNumeros((num) => [...num, '='])
          return;
        } if (e.key == '.') {
          numeros[numeros.length - 1] == '.' ? ' ' : setNumeros((num) => [...num, '.'])
          return;
        } if (numbers.includes(e.key) || operadores.includes(e.key)) {
          setNumeros((num) => [...num, e.key])
          return;
        }

      }
    }

    window.addEventListener("keydown", key)

    return () => window.removeEventListener('keydown', key);
  }, [])


  //logica de falar
  const [texto, setTexto] = useState();
  const [info, setInfo] = useState([]); // recebe o numero que o usuário clicar
  const [podeApagar, setPodeApagar] = useState(false);
  const msg = new SpeechSynthesisUtterance();

  function Reconhecer(numero) {
    if (operadores.includes(numero) || numero == '.') {
      switch (numero) {
        case '-':
          setTexto("menos");
          return;
        case '/':
          setTexto("dividido por");
          return;
        case '*':
          setTexto("vezes");
          return;
        case '+':
          setTexto("mais");
          return;
        case '.':
          setTexto("ponto");
      }
    }
    Falar(numero);
  }

  function Falar(mensagem) {
    msg.text = mensagem;
    window.speechSynthesis.speak(msg);
  }

  useEffect(() => {
    Reconhecer(info.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info])

  useEffect(() => {
    Falar(texto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto])


  //logica da calculadora

  // eslint-disable-next-line no-unused-vars
  const operadores = ['+', '-', '/', '*', '%'];

  function apagar() {
    setInfo(`apagou ${numeros[numeros.length - 1]}`)

    let apagarNumeros = [...numeros];
    apagarNumeros.pop();
    setNumeros(apagarNumeros);
    if (apagarNumeros != 0) {
      setInfo(`sobrou: ${apagarNumeros}`)
    }
    setPodeApagar(true);
  }

  function limpar() {
    setNumeros([]);
    setInfo('Apagou toda a operação');
  }

  // eslint-disable-next-line no-unused-vars
  let operadorSobrou = null;
  useEffect(() => {

    setPodeApagar(false)

    let join = '';
    join = numeros.join('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    expressao = join.split(/\s*([+\-*%/=])\s*/).filter(token => token !== '');

    if (expressao[0] == '-') {
      expressao[1] = `${parseInt(expressao[1] * -1)}`;
      expressao.splice(0, 1);
    }

    expressao.forEach((elemento, index) => {
      // if (expressao[index] == '.' && expressao[index - 1] == '.') {
      //   expressao[index - 1] = expressao[index];
      //   expressao.splice(index, 1);
      //   setNumeros(expressao);
      // }

      if (operadores.includes(expressao[index]) && operadores.includes(expressao[index - 1])) {
        expressao[index - 1] = expressao[index];
        expressao.splice(index, 1);
        setNumeros(expressao);
      }
    });

    if (expressao.includes('=')) {
      if (operadores.includes(expressao[0]) || expressao.length <= 3 || expressao[expressao.length - 1] != "=") {
        Reconhecer('operação invalida');
        setNumeros([]);
        return
      }
      if (expressao.length === 4 && expressao[3] == '=') {
        expressao.pop()
        conta();
        return
      }
    }


    if (expressao.length === 4 && operadores.includes(expressao[3])) {
      if (expressao[3] == '%') {
        expressao[2] = (expressao[2] * expressao[0]) / 100;
        expressao.pop();
        conta();
      } else {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        operadorSobrou = expressao[3];
        expressao.pop();
        conta()
      }
    } else {
      if (numeros.length > 0 && podeApagar == false && !isResult) {
        operadorSobrou = null;
        let elemento = numeros[numeros.length - 1];
        Reconhecer(elemento)
      }
      setIsResult(false)
    }
  }, [numeros])


  function conta() {
    const operacoes = [];
    const valores = [];


    expressao.forEach((elemento) => {
      if (operadores.includes(elemento)) {
        operacoes.push(elemento)
      }
      else { valores.push(parseFloat(elemento) || 0) }
    });

    for (let i = 0; i < operacoes.length; i++) {

      if (operacoes[i] === '*' || operacoes[i] === '/') {

        if (operacoes[i] === '*') {
          Reconhecer(`${valores[i]} vezes ${valores[i + 1]}`);
          valores[i] = valores[i] * valores[i + 1];

        } else if (operacoes[i] === '/') {
          if (valores[i + 1] !== 0) {
            Reconhecer(`${valores[i]} dividido por ${valores[i + 1]}`);
            valores[i] = valores[i] / valores[i + 1];

          } else {
            alert("essa operação não é permitida")
          }
        }

        valores.splice(i + 1, 1);
        operacoes.splice(i, 1);
        i--;
      }

    }
    for (let i = 0; i < operacoes.length; i++) {
      if (operacoes[i] === '+') {
        Reconhecer(`${valores[i]} mais ${valores[i + 1]}`);
        valores[i + 1] = valores[i] + valores[i + 1];
      } else {
        Reconhecer(`${valores[i]} menos ${valores[i + 1]}`);
        valores[i + 1] = valores[i] - valores[i + 1];
      }
    }

    let resultado = valores[valores.length - 1]

    if (operadorSobrou != null) {
      if (Number.isInteger(resultado)) {
        setIsResult(true)
        setNumeros([resultado, operadorSobrou]);
        Reconhecer(`é igual à ${resultado}`);
      } else {
        setIsResult(true)
        setNumeros([resultado.toFixed(2), operadorSobrou]);
        Reconhecer(`é igual à ${resultado.toFixed(2)}`);
      }
    } else {
      if (Number.isInteger(resultado)) {
        setIsResult(true)
        setNumeros([resultado]);
        Reconhecer(`é igual à ${resultado}`);
      } else {
        setIsResult(true)
        setNumeros([resultado.toFixed(2)]);
        Reconhecer(`é igual à ${resultado.toFixed(2)}`);
      }

    }
    return valores[valores.length - 1];
  }

  // function validOperation() {
  //   if ((operadores.includes(expressao[0]) || expressao.length < 3 || (expressao.length == 3 && expressao[expressao.length - 1] == "=")) && numeros.length < 1) {
  //     setNumeros([]);
  //     setInfo("a");
  //   } else {
  //     setNumeros([...numeros, '=']);
  //   }
  // }

  return (

    <>
      <Wrapper>
        <Calculadora>
          <Visor>
            <p>
              {numeros.length > 0 ? numeros.join('') : 0}
            </p>
          </Visor>
          <Teclas>
            <Coluna>
              {/* limpar */}
              <Tecla onClick={limpar}>C</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '7']) }}>7</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '4']) }}>4</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '1']) }}>1</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '0']) }}>0</Tecla>
            </Coluna>
            <Coluna>
              <Tecla onClick={() => { setNumeros([...numeros, '/']) }}><Divide size={48} strokeWidth={2} /></Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '8']) }}>8</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '5']) }}>5</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '2']) }}>2</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '.']) }}>.</Tecla>
            </Coluna>
            <Coluna>
              <Tecla onClick={() => { setNumeros([...numeros, '*']) }}><X size={48} strokeWidth={2} /></Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '9']) }}>9</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '6']) }}>6</Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '3']) }}>3</Tecla>
              {/* porcentagem */}
              <Tecla onClick={() => { setNumeros([...numeros, '%']) }}>%</Tecla>
            </Coluna>
            <Coluna>
              {/* delete */}
              <Tecla onClick={apagar}><Delete size={48} strokeWidth={2} /></Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '+']) }}><Plus size={48} strokeWidth={2} /></Tecla>
              <Tecla onClick={() => { setNumeros([...numeros, '-']) }}><Minus size={48} strokeWidth={2} /></Tecla>
              {/* mostrar */}
              <Tecla className="igual" onClick={() => setNumeros([...numeros, '='])}><Equal size={48} strokeWidth={2} /></Tecla>
            </Coluna>
          </Teclas>
        </Calculadora>
      </Wrapper>
    </>
  )
}

export default App

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 3rem;
 
  `
const Calculadora = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 20rem;
  height: 25rem;
  background-color: #dad7cd;
  border-radius: 1rem;
  `

const Visor = styled.div`
  border-radius: 1rem;
  width: 16rem;
  padding-block: 0.2rem;
  background-color: #a3b18a;
  box-shadow: 6px 6px #588157;
  margin-bottom: 1rem;
  text-align: right;
  padding-right: 30px;
  .p{
    display: flex;
    align-items: end;
    width: 100%;
    }

`

const Teclas = styled.div`
  display: flex;
  flex-direction: row;
  
`
const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  .igual{
    padding-block: 2.80rem;
    padding-inline: 1.45rem;
  }
`
const Tecla = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding-block: 1.15rem;
    padding-inline: 1.45rem;
    background-color: #a3b18a;
    border-radius: 1rem;
    box-shadow: 6px 6px #588157;
    margin: 2px;
    cursor: pointer;

`
