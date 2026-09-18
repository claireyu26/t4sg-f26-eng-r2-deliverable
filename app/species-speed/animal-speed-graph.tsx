/* eslint-disable */
"use client";
import { useEffect, useRef } from "react";
// @ts-ignore
import * as d3 from "d3";

interface AnimalDatum {
  name: string;
  speed: number;
  diet: "herbivore" | "omnivore" | "carnivore";
}

export default function AnimalSpeedGraph() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    d3.csv("/sample_animals.csv").then((raw) => {
      const data: AnimalDatum[] = raw
        .map((d: any) => ({
          name: String(d.name).trim(),
          speed: Number(d.speed),
          diet: String(d.diet).trim().toLowerCase() as AnimalDatum["diet"],
        }))
        .filter((d) => d.name && d.speed > 0 && ["herbivore", "omnivore", "carnivore"].includes(d.diet))
        .slice(0, 20);

      const svg = d3.select(ref.current);
      svg.selectAll("*").remove();

      const width = 700;
      const height = 400;
      const margin = { top: 30, right: 100, bottom: 70, left: 50 };

      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.name))
        .range([margin.left, width - margin.right])
        .padding(0.2);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.speed) || 100])
        .nice()
        .range([height - margin.bottom, margin.top]);

      const color = d3
        .scaleOrdinal<string>()
        .domain(["carnivore", "herbivore", "omnivore"])
        .range(["red", "green", "orange"]);

      const tooltip = d3
        .select("body")
        .append("div")
        .style("position", "fixed")
        .style("pointer-events", "none")
        .style("display", "none")
        .style("background", "black")
        .style("color", "white")
        .style("padding", "6px 8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("z-index", "50");

      // Bars
      svg
        .selectAll("rect.bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.name)!)
        .attr("y", (d) => y(d.speed))
        .attr("width", x.bandwidth())
        .attr("height", (d) => height - margin.bottom - y(d.speed))
        .attr("fill", (d) => color(d.diet))
        .on("mouseenter", (event, d) => {
          tooltip
            .text(`${d.name}: ${d.speed} km/h`)
            .style("left", `${event.clientX + 10}px`)
            .style("top", `${event.clientY - 30}px`)
            .style("display", "block");
        })
        .on("mousemove", (event) => {
          tooltip.style("left", `${event.clientX + 10}px`).style("top", `${event.clientY - 30}px`);
        })
        .on("mouseleave", () => tooltip.style("display", "none"));

      // Axes
      svg
        .append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end");

      svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));

      // Legend
      ["carnivore", "herbivore", "omnivore"].forEach((diet, i) => {
        svg
          .append("rect")
          .attr("x", width - margin.right + 10)
          .attr("y", margin.top + i * 20)
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", color(diet));

        svg
          .append("text")
          .attr("x", width - margin.right + 28)
          .attr("y", margin.top + i * 20 + 10)
          .text(diet)
          .attr("font-size", "12px");
      });
    });
  }, []);

  return <svg ref={ref} viewBox="0 0 700 400" className="h-auto w-full" />;
}
