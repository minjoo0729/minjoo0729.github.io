---
layout: page
permalink: /teaching/
title: teaching
description: Teaching assistant (TA) experience.
nav: false
nav_order: 6
---

<div class="teaching">
{% assign sorted_teachings = site.teachings | sort: "semester" | reverse %}
<ul class="teaching-list">
  {% for item in sorted_teachings %}
  <li class="teaching-entry">
    <div class="teaching-semester">{{ item.semester }}</div>
    <div class="teaching-details">
      <h3 class="teaching-course">{{ item.course }}</h3>
      <p class="teaching-meta">
        <strong>{{ item.role }}</strong>{% if item.professor %} &middot; Instructor: {{ item.professor }}{% endif %}
      </p>
      {% if item.description %}
      <p class="teaching-description">{{ item.description }}</p>
      {% endif %}
    </div>
  </li>
  {% endfor %}
</ul>
</div>
