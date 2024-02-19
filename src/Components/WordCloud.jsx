import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

const WordCloud = () => {
  const svgRef = useRef();
  const [containerSize, setContainerSize] = useState({ width: 500, height: 500 });

  useEffect(() => {
    if (!svgRef.current) return;

    const result = document.createElement('div');
    const lorem = `How the Word Cloud Generator Works

    The layout algorithm for positioning words without overlap is available on GitHub under an open source license as d3-cloud. Note that this is the only the layout algorithm and any code for converting text into words and rendering the final output requires additional development.
    
    As word placement can be quite slow for more than a few hundred words, the layout algorithm can be run asynchronously, with a configurable time step size. This makes it possible to animate words as they are placed without stuttering. It is recommended to always use a time step even without animations as it prevents the browsers event loop from blocking while placing the words.
    
    The layout algorithm itself is incredibly simple. For each word, starting with the most “important”:
    
    Attempt to place the word at some starting point: usually near the middle, or somewhere on a central horizontal line.
    If the word intersects with any previously placed words, move it one step along an increasing spiral. Repeat until no intersections are found.
    The hard part is making it perform efficiently! According to Jonathan Feinberg, Wordle uses a combination of hierarchical bounding boxes and quadtrees to achieve reasonable speeds.
    
    Glyphs in JavaScript
    
    There isnt a way to retrieve precise glyph shapes via the DOM, except perhaps for SVG fonts. Instead, we draw each word to a hidden canvas element, and retrieve the pixel data.
    
    Retrieving the pixel data separately for each word is expensive, so we draw as many words as possible and then retrieve their pixels in a batch operation.
    
    Sprites and Masks
    
    My initial implementation performed collision detection using sprite masks. Once a word is placed, it doesn't move, so we can copy it to the appropriate position in a larger sprite representing the whole placement area.
    
    The advantage of this is that collision detection only involves comparing a candidate sprite with the relevant area of this larger sprite, rather than comparing with each previous word separately.
    
    Somewhat surprisingly, a simple low-level hack made a tremendous difference: when constructing the sprite I compressed blocks of 32 1-bit pixels into 32-bit integers, thus reducing the number of checks (and memory) by 32 times.
    
    In fact, this turned out to beat my hierarchical bounding box with quadtree implementation on everything I tried it on (even very large areas and font sizes). I think this is primarily because the sprite version only needs to perform a single collision test per candidate area, whereas the bounding box version has to compare with every other previously placed word that overlaps slightly with the candidate area.
    
    Another possibility would be to merge a words tree with a single large tree once it is placed. I think this operation would be fairly expensive though compared with the analagous sprite mask operation, which is essentially ORing a whole block.`;

    d3.select(svgRef.current)
      .append(() => result);

    const words = tokenize(lorem);
    const d3Cloud = cloud();

    update(words);

    function update(words) {
      d3Cloud
        .words(words)
        .size([containerSize.width, containerSize.height])
        .font('Impact')
        .rotate(0)
        .fontSize(d => d.sizeFactor * 20) // Adjusted font size
        .on('end', draw)
        .start();
    }

    function draw(words) {
      const fill = d3.schemeCategory10;

      const cloud = d3.select(svgRef.current).selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-family', 'Impact')
        .style('fill', (d, i) => fill[i % 10])
        .attr('text-anchor', 'middle')
        .style('font-size', d => d.size + 'px')
        .attr('transform', d => `translate(${[d.x + containerSize.width / 2, d.y + containerSize.height / 2]})rotate(${d.rotate})`)
        .text(d => d.text)
        .on('click', token => console.log('clicked', { token }));
    }

    function tokenize(sentence) {
      let words = sentence
        .replace(/[()!.,:;?]/g, '')
        .replace(/\s+/g, ' ')
        .split(' ');

      words = words.reduce(function(wordMap, word) {
        wordMap[word] = (wordMap[word] || 0) + 1;
        return wordMap;
      }, {});

      const counters = Object.values(words);
      const max = Math.max(...counters);
      const min = Math.min(...counters);

      return Object.entries(words).map(([text, count]) => ({ text, sizeFactor: selectSizeFactor(min, max, count) }));
    }

    function selectSizeFactor(min, max, value) {
      const a = (max - min) / (10 - 1);
      const b = max - a * 10;
      return (value - b) / a;
    }

    window.d3 = d3;
  }, [containerSize]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0] && entries[0].contentRect) {
        setContainerSize({ width: entries[0].contentRect.width, height: entries[0].contentRect.height });
      }
    });
    resizeObserver.observe(svgRef.current.parentElement);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="word-cloud" style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default WordCloud;
