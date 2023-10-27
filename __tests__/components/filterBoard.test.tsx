import FilterBoardComponent from "../../app/components/FilterBoard";
import {fireEvent, render} from "@testing-library/react"

describe("FilterBoardComponent", () => {

    let component: HTMLElement

    const findById = (id: string) => {
        return component.querySelector(`#${id}`) ?? undefined
    }

    beforeEach(() => {
        component = render(
            <FilterBoardComponent
                initName=""
                initTypes={[
                    {label: "Bicycle Parking", value: "bicycle-parking", selected: true},
                    {label: "Toilets", value: "toilets", selected: true},
                ]}
                fetchPOIs={() => {}}
            />).container
    })

    it("updates name", () => {
        const name = findById("filter-name")
        expect(name).toBeDefined()
        expect(name).toHaveValue("")

        fireEvent.change(name!, {target: {value: "test"}})

        expect(name!).toHaveValue("test")
    })

    it("updates checkbox", () => {
        const checkbox = findById("filter-type-bicycle-parking")
        expect(checkbox).toBeDefined()
        expect(checkbox).toBeChecked()

        fireEvent.click(checkbox!)

        expect(checkbox!).not.toBeChecked()
    })
})