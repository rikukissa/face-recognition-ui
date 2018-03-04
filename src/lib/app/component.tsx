import * as React from "react";
import styled from "styled-components";
import { Debugger } from "./Debugger";

import { DEBUG } from "../../utils/config";

import { Speech } from "../../components/Speech";

const Container = styled.div`
  position: relative;
  height: 100%;
  background: radial-gradient(ellipse at center, #080a20 0%, #0d0e19 100%);
`;

export interface IDispatchProps {
  requestPeople: () => void;
}

export class App extends React.Component<IDispatchProps> {
  public componentDidMount() {
    this.props.requestPeople();
  }

  public render() {
    const greeting = "Salutations, Hacker Man";
    return (
      <Container>
        <Speech text={greeting} />
        {this.props.children}
        {DEBUG && <Debugger />}
      </Container>
    );
  }
}
