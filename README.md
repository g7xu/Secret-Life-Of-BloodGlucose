# Final-Project
Final Project for DSC 106

To get started:
located the data from the [website](https://physionet.org/content/cgmacros/1.0.0/), unzip it and rename the folder to `data`.

## Prototype Write-up:
1. So far we have done a lot of exploratory data analysis to understand all the facets of the data from our study and isolate key takeaways we want to communicate to our audience.
Namely, we wish to use data to inform users on the importance of their diet in managing their blood glucose levels, which impacts their wellbeing from moment-to-moment in terms of their energy level, as well as their health in the long-run, such as in predicting the onset of Type II Diabetes.
We first looked at meal distributions over time, to see if Non-diabetic, Pre-diabetic, and Diabetic individuals differ in their meal-eating habits.
We also made visualizations to understand how glucose spikes look over time, and understand how their relationship with different macronutrients taken in every meal, such as fiber. We found that more fiber causes less of a glucose spike.
We then made an outline of the story we wanted to tell based on these findings, and will be working on adding interactive visualizations and polishing them in the next steps.

2. The most challenging part is looking to be several small obstacles as opposed to anything major halting progress such as finding through EDA data anomalies presenting themselves right now for a subset of our diabetic participants who appear to eating into a strict regimen. Another issue that will present itself later is high data density pushing speedy data access to the foreground due to needing to have fast subsets of the data needing to be rendered. Although we may be able to solve the problem with JSON usage of only the data needed as opposed to what may be an API call to some cloud storage whether that’s necessary yet isn’t certain. 