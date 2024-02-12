import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import aapl from "../Data/aapl.csv";

const BlankChart = () => {
  const svgRef = useRef();

  useEffect(() => {
    // Load data from CSV file
    d3.csv(aapl).then((data) => {
      // Convert date strings to JavaScript date objects
      data.forEach((d) => {
        d.date = new Date(d.date);
        d.close = +d.close; // Convert to number
      });

      // Declare the chart dimensions and margins.
      const width = 928;
      const height = 500;
      const marginTop = 20;
      const marginRight = 30;
      const marginBottom = 30;
      const marginLeft = 40;

      // Declare the x (horizontal position) scale.
      const x = d3
        .scaleUtc()
        .domain(d3.extent(data, (d) => d.date))
        .range([marginLeft, width - marginRight]);

      // Declare the y (vertical position) scale.
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.close)])
        .range([height - marginBottom, marginTop]);

      // Declare the area generator.
      const area = d3
        .area()
        .x((d) => x(d.date))
        .y0(y(0))
        .y1((d) => y(d.close));

      // Select SVG element
      const svg = d3.select(svgRef.current);

      svg
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

      // Append a path for the area (under the axes).
      svg.append("path").attr("fill", "steelblue").attr("d", area(data));

      // Add the x-axis.
      svg
        .append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0)
        );

      // Add the y-axis, remove the domain line, add grid lines and a label.
      svg
        .append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(height / 40))
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g
            .selectAll(".tick line")
            .clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1)
        )
        .call((g) =>
          g
            .append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ Daily close ($)")
        );
    });
  }, []);

  return (
    <div>
      <svg ref={svgRef} />
    </div>
  );
};

export default BlankChart;
