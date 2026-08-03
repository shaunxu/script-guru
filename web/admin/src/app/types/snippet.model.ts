export interface SnippetParameter {
  name: string;
  type: string;
  required: boolean;
}

export interface Snippet {
  id: string | undefined;
  title: string;
  parameters: SnippetParameter[];
  code: string;
}
