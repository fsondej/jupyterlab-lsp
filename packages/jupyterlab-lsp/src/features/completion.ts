import { CompletionTriggerKind } from '../lsp';
import * as CodeMirror from 'codemirror';
import { CodeMirrorIntegration } from '../editor_integration/codemirror';

export class Completion extends CodeMirrorIntegration {
  name = 'Completion';
  private _completionCharacters: string[];

  get completionCharacters() {
    if (
      this._completionCharacters == null ||
      !this._completionCharacters.length
    ) {
      this._completionCharacters = this.connection.getLanguageCompletionCharacters();
    }
    return this._completionCharacters;
  }

  // public handleCompletion(completions: lsProtocol.CompletionItem[]) {
  // TODO: populate the (already displayed) completions list if the completions timed out initially?
  // }

  afterChange(change: CodeMirror.EditorChange): void {
    // TODO: maybe the completer could be kicked off in the handleChange() method directly; signature help still
    //  requires an up-to-date virtual document on the LSP side, so we need to wait for sync.
    if (
      change.text &&
      change.text[0].length == 1 &&
      (this.settings.get('continuousHinting') as boolean)
    ) {
      this.jupyterlab_components.invoke_completer(
        CompletionTriggerKind.Invoked
      );
      return;
    }

    let last_character = this.extract_last_character(change);
    if (this.completionCharacters.indexOf(last_character) > -1) {
      this.virtual_editor.console.log(
        'Will invoke completer after',
        last_character
      );
      this.jupyterlab_components.invoke_completer(
        CompletionTriggerKind.TriggerCharacter
      );
    }
  }
}
