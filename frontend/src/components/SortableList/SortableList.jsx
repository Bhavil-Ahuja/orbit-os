import { useMemo, useState } from 'react'
import {
  DndContext,
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

function SortableItem({ id, isAdmin, dragHandlePosition = 'left', children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handle = isAdmin ? (
    <span
      className="cursor-grab active:cursor-grabbing touch-none p-1 -m-1 rounded text-gray-500 hover:text-accent shrink-0 self-start mt-1"
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder"
    >
      <GripVertical size={16} />
    </span>
  ) : null

  return (
    <div ref={setNodeRef} style={style} className="flex items-stretch gap-2">
      {dragHandlePosition === 'left' && handle}
      <div className="min-w-0 flex-1">{children}</div>
      {dragHandlePosition === 'right' && handle}
    </div>
  )
}

/**
 * Wraps a list with drag-and-drop reorder. When isAdmin, shows a grip handle per item.
 * @param {Array} items - List of items
 * @param {(item) => string|number} getId - Return stable id for each item
 * @param {(orderedIds: (string|number)[]) => Promise<void>} onReorder - Called with new order of ids after drop
 * @param {boolean} isAdmin - Show drag handles and enable reorder
 * @param {'vertical'|'grid'} layout - vertical = single column, grid = preserve grid layout
 * @param {React.ReactNode} children - Render prop (item, index) => node, or static content
 */
export default function SortableList({
  items,
  getId,
  onReorder,
  isAdmin,
  layout = 'vertical',
  strategy = layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy,
  children,
}) {
  const [saving, setSaving] = useState(false)
  const ids = useMemo(() => items.map(getId), [items, getId])

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(active.id)
    const newIndex = ids.indexOf(over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const newOrder = arrayMove(ids, oldIndex, newIndex)
    setSaving(true)
    Promise.resolve(onReorder(newOrder))
      .catch((e) => window.alert(e?.message ?? 'Reorder failed'))
      .finally(() => setSaving(false))
  }

  if (!isAdmin) {
    return typeof children === 'function' ? (
      <div className={layout === 'grid' ? 'grid gap-4 md:grid-cols-2 items-stretch' : 'space-y-4 relative pl-0 sm:pl-2'}>
        {items.map((item, i) => children(item, i, null))}
      </div>
    ) : (
      children
    )
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={strategy}>
        <div
          className={
            layout === 'grid'
              ? 'grid gap-4 md:grid-cols-2 items-stretch'
              : 'space-y-4 relative pl-0 sm:pl-2'
          }
        >
          {items.map((item, i) => (
            <SortableItem
              key={getId(item)}
              id={getId(item)}
              isAdmin={isAdmin}
            >
              {typeof children === 'function' ? children(item, i, saving) : children}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
