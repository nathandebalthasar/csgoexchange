import styled from 'styled-components';

export const Loading = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #8075FF;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  animation: spin 2s linear infinite;
  margin-left: auto;
  margin-right: auto;
  margin-top: 4em;
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default Loading;
