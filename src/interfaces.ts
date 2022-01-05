export type PopupComponent<P> = (props: P) => JSX.Element

export interface PopupParams {
  id: string | number
  title: any
  desc: any
  closable: boolean
}

export interface PopupWindow<P = {}> {
  component: PopupComponent<Partial<PopupParams> & P>
  params: Partial<PopupParams> & P
  close: () => void
}
