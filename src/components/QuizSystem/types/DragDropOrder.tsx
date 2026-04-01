import { useState, useMemo } from 'react'
import { QuizQuestion } from '@/data/quizQuestions'
import styles from '../QuizSystem.module.css'
import { IoReorderThree } from 'react-icons/io5'
import {
  DndContext, 
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TypeProps {
  question: QuizQuestion
  onAnswer: (isCorrect: boolean) => void
  disabled: boolean
}

interface SortableItemProps {
  item: any
  disabled: boolean
}

function SortableItem({ item, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`${styles.dragItem} ${isDragging ? styles.dragging : ''}`}
      {...attributes} 
      {...listeners}
    >
      <div className={styles.dragHandle}>
        <IoReorderThree />
      </div>
      <span className={styles.itemLabel}>{item.label}</span>
    </div>
  )
}

export default function DragDropOrder({ question, onAnswer, disabled }: TypeProps) {
  const [items, setItems] = useState<any[]>(() => 
    [...(question.items || [])].sort(() => Math.random() - 0.5)
  )
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
    setActiveId(null)
  }

  const handleCheck = () => {
    const isCorrect = items.every((item, idx) => item.id === (question.correctAnswer as string[])[idx])
    onAnswer(isCorrect)
  }

  const activeItem = useMemo(() => 
    items.find(i => i.id === activeId), 
    [activeId, items]
  )

  return (
    <div className={styles.dragOrderContainer}>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.dragList}>
          <SortableContext 
            items={items.map(i => i.id)} 
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => (
              <SortableItem 
                key={item.id} 
                item={item} 
                disabled={disabled} 
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeId && activeItem ? (
            <div className={styles.dragOverlay}>
              <div className={styles.dragHandle}>
                <IoReorderThree />
              </div>
              <span className={styles.itemLabel}>{activeItem.label}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      <button 
        className={styles.checkBtn} 
        onClick={handleCheck}
        disabled={disabled}
      >
        VERIFICAR ORDEM!
      </button>
    </div>
  )
}
