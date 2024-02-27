import * as d3 from 'd3';
import cloud from 'd3-cloud';
import React, { useEffect, useRef } from 'react';

function WordCloud() {
  const svgRef = useRef();

  useEffect(() => {
    const words = ["Hello", "world", "normally", "you", "want", "more", "words", "than", "this"];

    const layout = cloud()
      .size([500, 500])
      .words(words.map(d => ({ text: d, size: Math.random() * 40 + 10 })))
      .padding(5) // Adjust the padding value as needed to prevent overlapping
      .rotate(() => (~~(Math.random() * 2) * 90))
      .font("Impact")
      .fontSize(d => d.size)
      .on("end", draw);

    layout.start();

    function draw(words) {
      d3.select(svgRef.current)
        .append("g")
        .attr("transform", "translate(250,250)")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", d => `${d.size}px`)
        .style("font-family", "Impact")
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text(d => d.text);
    }
  }, []);

  return (
    <div className="word-cloud">
      <svg ref={svgRef} width="500" height="500"></svg>
    </div>
  );
}

export default WordCloud;
