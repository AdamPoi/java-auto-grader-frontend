import useDialogState from '@/hooks/use-dialog-state'
import React, { useState } from 'react'
import { type Course } from '../data/types'

type coursesDialogType = 'delete'

interface coursesContextType {
    open: coursesDialogType | null
    setOpen: (str: coursesDialogType | null) => void
    currentRow: Course | null
    setCurrentRow: React.Dispatch<React.SetStateAction<Course | null>>
}

const CoursesContext = React.createContext<coursesContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function CoursesProvider({ children }: Props) {
    const [open, setOpen] = useDialogState<coursesDialogType>(null)
    const [currentRow, setCurrentRow] = useState<Course | null>(null)

    return (
        <CoursesContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </CoursesContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCoursesContext = () => {
    const coursesContext = React.useContext(CoursesContext)

    if (!coursesContext) {
        throw new Error('usecourses has to be used within <coursesContext>')
    }

    return coursesContext
}