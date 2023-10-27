import FilterBoardComponent from "../../app/components/FilterBoard";
import { fireEvent, render } from "@testing-library/react"

describe("FilterBoardComponent", () => {

    let component: HTMLElement

    const findById = (id: string) => {
        return component.querySelector(`#${id}`) ?? undefined
    }

    it("updates name", () => {
        component = render(
            <FilterBoardComponent
                setFilterName={(name) => {
                    expect(name).toBe("test");
                }}
                setFilterTypes={() => { }}
                types={[
                    { label: "Bicycle Parking", value: "bicycle-parking", selected: true },
                    { label: "Toilets", value: "toilets", selected: true },
                ]}
                filterPOIs={() => { }}
            />
        ).container
        
        const name = findById("filter-name")
        expect(name).toBeDefined()
        expect(name).toHaveValue("")

        fireEvent.change(name!, { target: { value: "test" } })

        expect(name!).toHaveValue("test")
    })

    it("updates checkbox", () => {
        component = render(
            <FilterBoardComponent
                setFilterName={() => { }}
                setFilterTypes={(types) => {
                    expect(types).toStrictEqual([
                        { label: "Bicycle Parking", value: "bicycle-parking", selected: false },
                        { label: "Toilets", value: "toilets", selected: true },
                    ])
                }}
                types={[
                    { label: "Bicycle Parking", value: "bicycle-parking", selected: true },
                    { label: "Toilets", value: "toilets", selected: true },
                ]}
                filterPOIs={() => { }}
            />).container

        const checkbox = findById("filter-type-bicycle-parking")
        expect(checkbox).toBeDefined()
        expect(checkbox).toBeChecked()

        fireEvent.click(checkbox!)

        expect(checkbox!).not.toBeChecked()
    })
})