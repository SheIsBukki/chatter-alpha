import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Transition,
} from "@headlessui/react";
import { HiCheck, HiChevronDown } from "react-icons/hi";
import { Fragment, useMemo, useState } from "react";
import type { TagsAutocompletionProps } from "@/components/lib/definitions";

export default function TagsAutoCompletion({
  tags,
  selectedTags,
  setSelectedTags,
}: TagsAutocompletionProps) {
  const [selected, setSelected] = useState(tags[0]);
  const [query, setQuery] = useState("");

  const filteredTags = useMemo(() => {
    return query === ""
      ? tags
      : tags.filter((tag) => {
          tag.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""));
        });
  }, [query, tags]);

  return (
    <Combobox
      value={selected}
      onChange={(tag) => {
        setSelected(tag);
        setSelectedTags((prev) => [...prev, tag]);
      }}
    >
      <div className="relative mt-1">
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
          <ComboboxInput
            className="w-full border-none border-gray-400 px-4 py-2 pr-10 text-sm leading-5 text-gray-900 outline-none focus:ring-0"
            displayValue={(tag: { name: string }) => tag.name}
            onChange={(event) => setQuery(event.target.value)}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
            <HiChevronDown
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </ComboboxButton>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100 "
          leaveFrom="opactiy-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <ComboboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredTags.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                Nothing found.
              </div>
            ) : (
              filteredTags.map((tag) => (
                <ComboboxOption
                  key={tag.id}
                  value={tag}
                  className={({ focus }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      focus
                        ? "bg-gray-600 text-white"
                        : "text-gray-900 dark:text-gray-100"
                    }`
                  }
                >
                  {({ selected, focus }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {tag.name}
                      </span>
                      {selectedTags.includes(tag) ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            focus
                              ? "text-white dark:text-black"
                              : "text-gray-600"
                          }`}
                        >
                          <HiCheck className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </Transition>
      </div>
    </Combobox>
  );
}
