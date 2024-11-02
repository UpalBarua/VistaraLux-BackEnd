import { Document } from "mongoose"

interface ThisDocument extends Document{
    createdAt: Date
    discount?: number
    total?:number
}

type FuncProps = {
    length: number
    docArr: ThisDocument[]
    today: Date
    property?: "discount" | "total"
}

export const getChartData = ({ length, docArr, today, property }: FuncProps) => {
    const data:number[] = new Array(length).fill(0)

    docArr.forEach(i => {
        const creationDate = i.createdAt
        const monthsDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12

        if (monthsDiff < length) {
            data[length - monthsDiff - 1] += property ? i[property]! : 1
        }
    })
    return data
}