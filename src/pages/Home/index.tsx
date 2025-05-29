import { HandPalm, Play } from "phosphor-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { differenceInSeconds } from "date-fns"
import { useState, useEffect } from "react"
import * as zod from 'zod'


import { HomeContainer, FormContainer, CountdownContainer, Separator, 
  StartCountdownButton, StopCountdownButton, TaskInput, MinutesAmountInput } from "./styles"


const newCycleFormValidationShema = zod.object({
  task: zod.string().min(1, 'Informe a tarefa'),
  minutesAmount: zod.number()
  .min(1, 'O ciclo precisa ser de no minimo 5 minutos')
  .max(60, 'O ciclo precisa ser de no máximo 60 minutos'),
})

type NewCycleFormData = zod.infer<typeof newCycleFormValidationShema>


interface Cycle {
  id: string,
  task: string,
  minutesAmount: number,
  startDate: Date
  interruptedDate?: Date
  finishedDate?: Date
}

export function Home() {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
  const [amountSecoundsPassed, setAmountSecoundsPassed] = useState(0)
  

  const { register, handleSubmit, watch, reset } = useForm({
    resolver: zodResolver(newCycleFormValidationShema),
    defaultValues: {
      task: '',
      minutesAmount: 0,
    }
  })

  const activeCycle = cycles.find((cycle) => cycle.id == activeCycleId)
  
  const totalSeconds = activeCycle ? activeCycle.minutesAmount * 60 : 0

  useEffect(() => {
    let interval: number

    if (activeCycle) {
      interval = setInterval(() => {
        const secondsDifference = 
          differenceInSeconds(new Date(), activeCycle.startDate,
        )

        if (secondsDifference >= totalSeconds){
          setCycles((state) =>
          state.map((cycle) => {
            if (cycle.id == activeCycleId) {
              return { ...cycle, finishedDate: new Date() }
            } else {
              return cycle
            }
          }),
        )
        
        setAmountSecoundsPassed(totalSeconds)
        clearInterval(interval)
        } else {
          setAmountSecoundsPassed(secondsDifference)
        }
      }, 1000)
    } 

    return () => {
      clearInterval(interval)
    }

  }, [activeCycle, totalSeconds, activeCycleId])


  function handleCreateNewCycle(data: NewCycleFormData) {
    const id = String(new Date().getTime());

    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }

      setCycles((state) => [...state, newCycle])
      setActiveCycleId(id)
      setAmountSecoundsPassed(0)

      reset()
  }


  function handleInterruptCycle() {
    setCycles ((state) =>
      state.map((cycle) => {
        if (cycle.id == activeCycleId){
          return { ...cycle, interruptedDate: new Date() }
        } else {
          return cycle
        }
      }),
    )
    setActiveCycleId(null)
  }  

  const currentSeconds = activeCycle ? totalSeconds - amountSecoundsPassed : 0

  const minutesAmount = Math.floor(currentSeconds / 60)
  const secondsAmount = currentSeconds % 60

  const minutes = String(minutesAmount).padStart(2, '0')
  const seconds = String(secondsAmount).padStart(2, '0')

  useEffect(() => {
    if (activeCycle) {
      document.title = `${minutes}:${seconds}`
    }
  }, [minutes, seconds, activeCycle ])

  const task = watch('task');
  const isSubmitDisabled = !task;

  return (
    <HomeContainer>
      <form onSubmit={handleSubmit(handleCreateNewCycle)}  action="">
        <FormContainer>
          <label htmlFor="task">Vou trabalhar em</label>
          <TaskInput 
          id="task" 
          list="task-suggestions" 
          placeholder="Dê um nome para o seu projecto" 
          disabled={!!activeCycle}
          {...register('task')}
          />


          <datalist id="task-suggestions" > 
            <option value="Projecto 1" />
            <option value="Projecto 2" />
            <option value="Projecto 3" />
            <option value="Wiligramas" />
          </datalist>


          <label htmlFor="minutesAmount">durante</label>
          <MinutesAmountInput type="number" id="minutesAmount" 
          placeholder="00" 
          step={5}
          min={1}
          max={60}
          disabled={!!activeCycle}
          {...register('minutesAmount', {valueAsNumber: true })}
          />
          <span>minutos.</span>
        </FormContainer>

        <CountdownContainer>
          <span>{minutes[0]}</span>
          <span>{minutes[1]}</span>
          <Separator>:</Separator>
          <span>{seconds[0]}</span>
          <span>{seconds[1]}</span>
        </CountdownContainer>

        { activeCycle ? (
          <StopCountdownButton  onClick={handleInterruptCycle} type="button">
            <HandPalm size={24}/>
            Interromper
        </StopCountdownButton>
        ) : (
          <StartCountdownButton disabled={isSubmitDisabled} type="submit">
            <Play size={24}/>
            Começar
        </StartCountdownButton>
        )}
      </form>
    </HomeContainer>
  )
} 