#!/usr/bin/env python
# coding: utf-8

# In[97]:


import pandas as pd
import numpy as np
import os
import seaborn as sns
import matplotlib as plt


# #### my guess of what the issue is currently the food can't be matched with the libre GL?
# perhaps i can approximate with dexcom readings of the food and \
# guess on the relative scale of the participants in that dataset and approximate that the same food in this dataset(cgmarcos) \
# has the same relative change in glucose given features of the participant (particant_weight_cgm == particant_weight_big_ideas, etc.))

# In[21]:


# path of  where the original data is to find a distinct dummy variable
# for pre dia , dia, and non
# C:\Users\najer\OneDrive - UC San Diego\winter_2025\final_project_data\data\cgmacros-a-scientific-dataset-for-personalized-nutrition-and-diet-monitoring-1.0.0


# In[4]:


dexcom_equivalent = pd.read_csv("cleaned_data/CGMacros-001.csv")


# In[61]:


# get_ipython().run_line_magic('ls', '')


# In[59]:


dexcom_equivalent.head()


# In[63]:


# (dexcom_equivalent["Timestamp"][0]).month
# i think the script is currently missing dropping the 11th day and making timestampe to_datetime?


# In[18]:


(dexcom_equivalent["Libre GL"]).value_counts(dropna=False).sum()


# In[19]:


(dexcom_equivalent["Dexcom GL"]).value_counts(dropna=False).sum()


# #### i think it be fine if we relinquish few hundred points per participant unless we do a prediction of the free space available in the groups
# _____

# In[22]:


# get_ipython().run_line_magic('pwd', '')


# In[23]:


# get_ipython().run_line_magic('ls', '')


# #### we can make groups of  A1c (this is how pre dia, dia, non is declrared)
# 
# 
# 
# 
# | normal      | Prediabetes     | diabetes |
# | ------------- | ------------- | ------- |
# | below 5.7% | : 5.7% to 6.4% | Diabetes: 6.5% or above | 
# | *units in A1c*

# In[48]:


filtering_participants = pd.read_csv("cleaned_data/bio.csv")


# In[53]:


filtering_participants.head()


# In[44]:


filtering_participants["A1c PDL (Lab)"]


# In[50]:


def bin_a1c(df):
    df['Normal'] = np.where(df['A1c PDL (Lab)'] < 5.7, 1, 0)
    df['Prediabetes'] = np.where((df['A1c PDL (Lab)'] >= 5.7) & (df['A1c PDL (Lab)'] < 6.5), 1, 0)
    df['Diabetes'] = np.where(df['A1c PDL (Lab)'] >= 6.5, 1, 0)
    return df






# In[ ]:





# In[51]:


participants_group = bin_a1c(filtering_participants)
participants_group


# #### im using dummy variables since we'll eventually need to use decision trees when the quiz is implemented

# In[65]:


participants_group.to_csv("bio_mutated.csv")


# In[67]:


# get_ipython().run_line_magic('ls', '')


# _______

# In[5]:


pd.read_csv("data/CGMacros/CGMacros-001/CGMacros-001.csv")


# ### Missing files: [24, 25, 37, 40]

# In[10]:


def find_missing_files(directory):
    missing_files = []
    for i in range(1, 50):
        filename = f"CGMacros-{i:03d}.csv"
        filepath = os.path.join(directory, f"CGMacros-{i:03d}", filename)
        if not os.path.exists(filepath):
            missing_files.append(i)
    return missing_files

directory = "data/CGMacros"
missing_files = find_missing_files(directory)
if missing_files:
    print(f"Missing files: {missing_files}")
else:
    print("All files are present")


# In[11]:


excluded_participants = [24, 25, 37, 40]
filenames = [f"data/CGMacros/CGMacros-{i:03d}/CGMacros-{i:03d}.csv" for i in range(1, 50) if i not in excluded_participants]
dataframes = [pd.read_csv(filename) for filename in filenames]


# In[53]:


dataframes[0]


# In[20]:


def check_missing_values(dataframes):
    columns_to_check = ['Calories', 'Carbs', 'Protein', 'Fat', 'Fiber']
    valid_dataframes = []
    for i, df in enumerate(dataframes):
        for column in columns_to_check:
            if df[column].isna().sum() != len(df):
                valid_dataframes.append(i)
                break
    return valid_dataframes


# In[21]:


check_missing_values(dataframes) # find the quantity of data actually present in these dataframes i.e. its 2 meals why bother


# In[22]:


def check_missing_values(dataframes):
    columns_to_check = ['Calories', 'Carbs', 'Protein', 'Fat', 'Fiber']
    valid_dataframes = {}
    for i, df in enumerate(dataframes):
        missing_values = {column: df[column].isna().sum() for column in columns_to_check}
        valid_dataframes[i] = missing_values
    return valid_dataframes


# In[23]:


check_missing_values(dataframes)


# In[24]:


# only participant 6 might even have data directly inputted


# ___
# #### im going to conclusively use the big ideas dataset to approximate ?!?!?!
# #### maybe use image recognition to at least find the food?!?!?

# ## cant use dexcom at all cant use marcos either only have jpgs for (maybe use the xgboost model the paper)
# ## image recognition and calories

# In[26]:


# get_ipython().run_line_magic('ls', '')


# In[29]:


excluded_participants = [24, 25, 37, 40]
filenames = [f"cleaned_data/CGMacros-{i:03d}.csv" for i in range(1, 50) if i not in excluded_participants]
dataframes = [pd.read_csv(filename) for filename in filenames]


# In[33]:


participant_groups = pd.read_csv("data/CGMacros/bio_mutated.csv")


# In[34]:


participant_groups


# In[45]:


indices = {column: np.where(participant_groups[column] == 1)[0] for column in ['Normal', 'Prediabetes', 'Diabetes']}

for key, value in indices.items():
    print(f"Indices of 1's in column '{key}': {value}")


# In[46]:


indices


# In[41]:


# np.array(missing_files) - 1


# In[47]:


remove_indices = [23, 24, 36, 39]

# remove entry pairs with equal to missing participants
for key, value in list(indices.items()):
    indices[key] = np.array([x for x in value if x not in remove_indices])


# In[48]:


indices


# In[49]:


participant_groups


# In[50]:


dataframes_normal = [dataframes[i] for i in indices['Normal']]
dataframes_prediabetes = [dataframes[i] for i in indices['Prediabetes']]
dataframes_diabetes = [dataframes[i] for i in indices['Diabetes']]


# In[52]:


dataframes_normal[0]


# In[106]:


len(dataframes_normal)


# In[ ]:





# In[ ]:





# ___
# TODO normalize across the groups for now graph absolute GL across the groups of dataframes

# In[62]:


normal_gl_df = pd.concat([df['Libre GL'] for df in dataframes_normal], axis=1)
pre_gl_df = pd.concat([df['Libre GL'] for df in dataframes_prediabetes], axis=1)
dia_gl_df = pd.concat([df['Libre GL'] for df in dataframes_diabetes], axis=1)


# In[64]:


dia_gl_df


# In[81]:


populated_normal = normal_gl_df.dropna(how='any')

# calculate the average of the row
temp_df_0 = (populated_normal.sum(axis=1)) / len(populated_normal.columns)

temp_df_0 = pd.DataFrame(temp_df_0)


# In[107]:


temp_df_0


# In[82]:


populated_pre = pre_gl_df.dropna(how='any')

# calculate the average of the row
temp_df_1 = (populated_pre.sum(axis=1)) / len(populated_pre.columns)

temp_df_1 = pd.DataFrame(temp_df_1)


# In[108]:


temp_df_1


# In[83]:


populated_dia = dia_gl_df.dropna(how='any')

# calculate the average of the row
temp_df_2 = (populated_dia.sum(axis=1)) / len(populated_dia.columns)

temp_df_2 = pd.DataFrame(temp_df_2)


# In[86]:


final_df = pd.concat([temp_df_0, temp_df_2,temp_df_1], axis=1)
final_df.columns = ["Normal", "Diabetic","Pre-Diabetic"
                   ]
final_df


# In[93]:


time_truncated = pd.DataFrame(dataframes[0]['Timestamp'].values[:len(final_df)])


# In[96]:


final_df["Timestamp"] = time_truncated
final_df


# In[104]:


final_df.to_csv("absolute_gl_values_grouped_h1Ac.csv")


# In[103]:


plt.pyplot(final_df['Timestamp'], final_df['Normal'], label='Normal')
plt.pyplot(final_df['Timestamp'], final_df['Pre-Diabetic'], label='Pre-Diabetic')
plt.pyplot(final_df['Timestamp'], final_df['Diabetic'], label='Diabetic')

plt.xlabel('Timestamp')
plt.ylabel('GL')
plt.title('Absolute GL values of Normal, Pre-Diabetic, and Diabetic')
plt.legend()

plt.show()


# In[ ]:


# df_melt = final_df.melt(id_vars='Timestamp', value_vars=['Normal', 'Diabetic', 'Pre-Diabetic'])
# # df_melt
# sns.lineplot(x='Timestamp', y='value', hue='variable', data=df_melt)



# In[ ]:




