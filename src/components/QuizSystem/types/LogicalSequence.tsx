import DragDropOrder from './DragDropOrder'

export default function LogicalSequence(props: any) {
  // Reusa o componente de ordenação, pois a lógica é a mesma (item sequence check)
  return <DragDropOrder {...props} />
}
