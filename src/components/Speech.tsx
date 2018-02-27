import * as React from "react";
import { sayShit } from "../lib/speech/speak";

interface ISpeechProps {
  text: string;
}

export class Speech extends React.Component<ISpeechProps, {}> {
  protected speak(text: string) {
    sayShit(text);
  }

  // say new thing if component updates, but don't repeat...
  public shouldComponentUpdate(nextProps: ISpeechProps) {
    if (nextProps.text !== this.props.text) {
      this.speak(nextProps.text);
      return true;
    }
    return false;
  }

  public componentWillMount() {
    this.speak(this.props.text);
  }

  public render() {
    return <span />;
  }
}
